import type { EncounterData, CombatEncounterData, MonsterData, ScalingMechanic } from '../types';
import type { BossEncounterData } from '../types/EncounterData';
import { EncounterType, EncounterDifficulty } from '../types';
import { monsterLibrary } from '../data/monsterLibrary';

export interface PartyConfig {
    size: number;        // Number of characters (1-8)
    averageLevel: number; // Average party level (1-20)
}

// =========================================
// Tier Utility Functions
// =========================================

/**
 * Get the tier of play for a given level
 * Tier 1: Levels 1-4
 * Tier 2: Levels 5-10
 * Tier 3: Levels 11-16
 * Tier 4: Levels 17-20
 */
export function getTierForLevel(level: number): number {
    if (level <= 4) return 1;
    if (level <= 10) return 2;
    if (level <= 16) return 3;
    return 4;
}

/**
 * Check if two levels are in the same tier of play
 */
export function areSameTier(level1: number, level2: number): boolean {
    return getTierForLevel(level1) === getTierForLevel(level2);
}

// =========================================
// Scaling Mechanics Functions
// =========================================

/**
 * XP Budget per Character by Level (D&D 2024 Rules)
 * Index is (level - 1), value is [Low, Moderate, High]
 */
const XP_BUDGET_TABLE: [number, number, number][] = [
    [50, 75, 100],       // Level 1
    [100, 150, 200],     // Level 2
    [150, 225, 400],     // Level 3
    [250, 375, 500],     // Level 4
    [500, 750, 1100],    // Level 5
    [600, 1000, 1400],   // Level 6
    [750, 1300, 1700],   // Level 7
    [1000, 1700, 2100],  // Level 8
    [1300, 2000, 2600],  // Level 9
    [1600, 2300, 3100],  // Level 10
    [1900, 2900, 4100],  // Level 11
    [2200, 3700, 4700],  // Level 12
    [2600, 4200, 5400],  // Level 13
    [2900, 4900, 6200],  // Level 14
    [3300, 5400, 7800],  // Level 15
    [3800, 6100, 9800],  // Level 16
    [4500, 7200, 11700], // Level 17
    [5000, 8700, 14200], // Level 18
    [5500, 10700, 17200],// Level 19
    [6400, 13200, 22000] // Level 20
];

/**
 * Get the XP budget per character for a given level and difficulty
 */
export function getXPBudgetPerCharacter(
    level: number,
    difficulty: EncounterDifficulty
): number {
    const clampedLevel = Math.max(1, Math.min(20, level));
    const budgets = XP_BUDGET_TABLE[clampedLevel - 1];

    switch (difficulty) {
        case EncounterDifficulty.Low:
            return budgets[0];
        case EncounterDifficulty.Moderate:
            return budgets[1];
        case EncounterDifficulty.High:
            return budgets[2];
        default:
            return budgets[1]; // Default to moderate
    }
}

/**
 * Calculate the total XP budget for a party
 */
export function calculatePartyXPBudget(
    partyLevel: number,
    partySize: number,
    difficulty: EncounterDifficulty
): number {
    const perCharacter = getXPBudgetPerCharacter(partyLevel, difficulty);
    return perCharacter * partySize;
}

/**
 * Find the difficulty tier that best matches a given XP value for a party.
 * This prevents scaling from adding too many monsters by finding which
 * difficulty the encounter's current XP naturally fits into.
 * 
 * @param currentXP - The encounter's current total monster XP
 * @param partyLevel - The party's current level
 * @param partySize - Number of party members
 * @param maxDifficulty - The maximum difficulty to consider (caps the result)
 * @returns The best-fit difficulty and the corresponding XP budget
 */
export function findBestFitDifficulty(
    currentXP: number,
    partyLevel: number,
    partySize: number,
    maxDifficulty: EncounterDifficulty
): { difficulty: EncounterDifficulty; targetXP: number } {
    // Get XP budgets for each difficulty at the party's level
    const lowBudget = calculatePartyXPBudget(partyLevel, partySize, EncounterDifficulty.Low);
    const moderateBudget = calculatePartyXPBudget(partyLevel, partySize, EncounterDifficulty.Moderate);
    const highBudget = calculatePartyXPBudget(partyLevel, partySize, EncounterDifficulty.High);

    // Helper to check if a difficulty is allowed based on maxDifficulty
    const difficultyOrder = [EncounterDifficulty.Low, EncounterDifficulty.Moderate, EncounterDifficulty.High];
    const maxIndex = difficultyOrder.indexOf(maxDifficulty);
    const isAllowed = (diff: EncounterDifficulty) => difficultyOrder.indexOf(diff) <= maxIndex;

    // Find the best fit:
    // - If currentXP is closer to Low budget, use Low
    // - If currentXP is closer to Moderate budget, use Moderate
    // - If currentXP is closer to High budget, use High (if allowed)

    // Calculate thresholds (midpoints between tiers)
    const lowToModerateThreshold = (lowBudget + moderateBudget) / 2;
    const moderateToHighThreshold = (moderateBudget + highBudget) / 2;

    if (currentXP <= lowToModerateThreshold) {
        return { difficulty: EncounterDifficulty.Low, targetXP: lowBudget };
    } else if (currentXP <= moderateToHighThreshold) {
        if (isAllowed(EncounterDifficulty.Moderate)) {
            return { difficulty: EncounterDifficulty.Moderate, targetXP: moderateBudget };
        } else {
            return { difficulty: EncounterDifficulty.Low, targetXP: lowBudget };
        }
    } else {
        if (isAllowed(EncounterDifficulty.High)) {
            return { difficulty: EncounterDifficulty.High, targetXP: highBudget };
        } else if (isAllowed(EncounterDifficulty.Moderate)) {
            return { difficulty: EncounterDifficulty.Moderate, targetXP: moderateBudget };
        } else {
            return { difficulty: EncounterDifficulty.Low, targetXP: lowBudget };
        }
    }
}

/**
 * Scale a DC value based on level difference
 * Formula: +1 DC per 2 levels above reference (per SCALING_GUIDE.md)
 * Level Difference | DC Adjustment
 * +1 to +2         | +1
 * +3 to +4         | +2
 * +5 to +6         | +3
 * Negative differences do NOT reduce DC (encounters don't get easier)
 */
export function scaleDC(baseDC: number, levelDifference: number): number {
    if (levelDifference <= 0) return baseDC;
    const adjustment = Math.floor((levelDifference + 1) / 2);
    return baseDC + adjustment;
}

/**
 * Scale damage dice based on level difference
 * Formula: +1d6 per 2 levels above reference (per SCALING_GUIDE.md)
 * Parses damage strings like "2d6", "3d8+5", etc.
 * Level Difference | Damage Adjustment
 * +1 to +2         | +1d6
 * +3 to +4         | +2d6
 * +5 to +6         | +3d6
 */
export function scaleDamage(baseDamage: string, levelDifference: number): string {
    if (levelDifference <= 0 || !baseDamage) return baseDamage;

    const additionalDice = Math.floor((levelDifference + 1) / 2);
    if (additionalDice === 0) return baseDamage;

    // Parse the damage string (e.g., "2d6", "3d8+5", "1d10-2")
    const match = baseDamage.match(/^(\d+)d(\d+)(.*)?$/);
    if (!match) {
        // If we can't parse it, just append the additional dice
        return `${baseDamage} + ${additionalDice}d6`;
    }

    const [, diceCount, diceSize, modifier] = match;
    // Add extra d6s as a separate term to preserve original dice type
    const extraDamage = `${additionalDice}d6`;
    return `${diceCount}d${diceSize}${modifier || ''} + ${extraDamage}`;
}

/**
 * Scale all scaling mechanics in an encounter based on level difference
 * Returns a new array with scaled DC and damage values
 */
export function scaleScalingMechanics(
    mechanics: ScalingMechanic[] | undefined,
    levelDifference: number
): ScalingMechanic[] | undefined {
    if (!mechanics || mechanics.length === 0) return mechanics;

    return mechanics.map(mechanic => ({
        ...mechanic,
        dc: mechanic.dc !== undefined ? scaleDC(mechanic.dc, levelDifference) : undefined,
        damage: mechanic.damage !== undefined ? scaleDamage(mechanic.damage, levelDifference) : undefined
    }));
}

// =========================================
// Original Scaling Functions
// =========================================

/**
 * Calculate the appropriate monster count multiplier based on party size
 * Default party size is 4, so:
 * - Party of 2 = 0.5x monsters
 * - Party of 4 = 1.0x monsters (baseline)
 * - Party of 6 = 1.5x monsters
 * - Party of 8 = 2.0x monsters
 */
export function calculateMonsterMultiplier(partySize: number): number {
    const basePartySize = 4;
    return partySize / basePartySize;
}

/**
 * Adjust difficulty tier based on party level vs encounter CR
 * If party is significantly higher level than the encounter, increase difficulty
 * If party is lower level, decrease difficulty
 */
export function adjustDifficultyTier(
    baseDifficulty: EncounterDifficulty,
    encounterCR: number,
    partyLevel: number
): EncounterDifficulty {
    const levelDifference = partyLevel - encounterCR;

    // Party is 2+ levels above CR: increase difficulty
    if (levelDifference >= 2) {
        if (baseDifficulty === EncounterDifficulty.Low) return EncounterDifficulty.Moderate;
        if (baseDifficulty === EncounterDifficulty.Moderate) return EncounterDifficulty.High;
        return baseDifficulty; // Already high
    }

    // Party is 2+ levels below CR: decrease difficulty
    if (levelDifference <= -2) {
        if (baseDifficulty === EncounterDifficulty.High) return EncounterDifficulty.Moderate;
        if (baseDifficulty === EncounterDifficulty.Moderate) return EncounterDifficulty.Low;
        return baseDifficulty; // Already low
    }

    // Party level is within 1 level of CR: keep original difficulty
    return baseDifficulty;
}

/**
 * Scale monster counts in an encounter based on party size only
 * Returns a new array of monsters with adjusted counts
 */
function scaleMonsterCountsByPartySize(monsters: MonsterData[], multiplier: number): MonsterData[] {
    return monsters.map(monster => ({
        ...monster,
        count: Math.max(1, Math.round((monster.count || 1) * multiplier))
    }));
}

/**
 * Recalculate XP budget based on current monsters
 */
function recalculateXPBudget(monsters: MonsterData[]): number {
    return monsters.reduce((total, monster) => {
        return total + (monster.exp * (monster.count || 1));
    }, 0);
}

/**
 * Get low-CR minions suitable for adding to an encounter
 * Prioritizes monsters with CR 1/8 or 1/4 (25-50 XP typically)
 */
function getLowCRMinions(): MonsterData[] {
    // Get monsters with CR 0 to 0.25 as potential minions
    const minions = monsterLibrary.getMonstersByCR(0, 0.25);
    // Filter to only include those with reasonable XP (10-50)
    return minions.filter(m => m.exp >= 10 && m.exp <= 50);
}

/**
 * Threshold for when to consider using a swarm instead of individual monsters.
 * If we would add more than this many of a single creature, look for a swarm.
 */
const SWARM_THRESHOLD = 5;

/**
 * Try to find a swarm version of a given monster.
 * Swarms in D&D typically follow the naming pattern "Swarm of {Creature}s"
 * 
 * @param monster - The monster to find a swarm for
 * @returns The swarm monster if found, null otherwise
 */
function findSwarmFor(monster: MonsterData): MonsterData | null {
    // Common swarm naming patterns:
    // "Rat" -> "Swarm of Rats"
    // "Spider" -> "Swarm of Spiders"
    // "Bat" -> "Swarm of Bats"
    // "Insect" -> "Swarm of Insects"

    const baseName = monster.name.toLowerCase();

    // Generate potential swarm names
    const potentialSwarmNames = [
        `swarm of ${baseName}s`,     // e.g., "swarm of rats"
        `swarm of ${baseName}`,       // e.g., "swarm of bat" (in case plural not used)
        `${baseName} swarm`,          // e.g., "rat swarm"
    ];

    // Also try adding common pluralization rules
    if (baseName.endsWith('s') || baseName.endsWith('x') || baseName.endsWith('ch') || baseName.endsWith('sh')) {
        potentialSwarmNames.push(`swarm of ${baseName}es`);
    }

    // Search for matching swarm in the library
    for (const swarmName of potentialSwarmNames) {
        const swarm = monsterLibrary.getMonsterByName(swarmName);
        if (swarm) {
            return swarm;
        }

        // Also try searching by ID pattern
        const swarmId = swarmName.replace(/\s+/g, '-');
        const swarmById = monsterLibrary.getMonsterById(swarmId);
        if (swarmById) {
            return swarmById;
        }
    }

    // Also search using the monster library's search function
    const searchResults = monsterLibrary.searchMonsters('swarm');
    for (const swarm of searchResults) {
        const swarmNameLower = swarm.name.toLowerCase();
        if (swarmNameLower.includes(baseName) ||
            swarmNameLower.includes(baseName.slice(0, -1))) { // Try without plural 's'
            return swarm;
        }
    }

    return null;
}

/**
 * Substitute swarms for large counts of individual monsters.
 * If a monster count exceeds SWARM_THRESHOLD, try to use swarm(s) + remainder.
 * 
 * @param monsters - The monsters array to process
 * @returns New array with swarms substituted where appropriate
 */
function substituteSwarms(monsters: MonsterData[]): MonsterData[] {
    const result: MonsterData[] = [];

    for (const monster of monsters) {
        const count = monster.count || 1;

        // Only consider swarm substitution for large counts
        if (count >= SWARM_THRESHOLD) {
            const swarm = findSwarmFor(monster);

            if (swarm) {
                // A swarm typically represents ~10 creatures
                // Use 1 swarm per 8-10 creatures (we'll use 8 for generous swarm usage)
                const CREATURES_PER_SWARM = 8;
                const swarmCount = Math.floor(count / CREATURES_PER_SWARM);
                const remainder = count % CREATURES_PER_SWARM;

                if (swarmCount > 0) {
                    result.push({
                        ...swarm,
                        count: swarmCount
                    });

                    console.log(
                        `Swarm substitution: ${count}x ${monster.name} -> ` +
                        `${swarmCount}x ${swarm.name}` +
                        (remainder > 0 ? ` + ${remainder}x ${monster.name}` : '')
                    );

                    // Add remainder as individual monsters
                    if (remainder > 0) {
                        result.push({
                            ...monster,
                            count: remainder
                        });
                    }
                    continue;
                }
            }
        }

        // No swarm substitution - add monster as-is
        result.push(monster);
    }

    return result;
}

/**
 * Scale monsters to match a target XP budget
 * This function:
 * 1. First scales existing monster counts based on party size
 * 2. Then adds low-CR minions if needed to meet the target XP budget
 * 3. Or increases existing monster counts if we're under budget
 * 
 * @param monsters - Original monster array
 * @param targetXP - Target XP budget to reach
 * @param partySize - Party size for base multiplier
 * @param levelDifference - Difference between party level and encounter level (positive = party higher)
 */
function scaleMonstersToXPBudget(
    monsters: MonsterData[],
    targetXP: number,
    partySize: number,
    levelDifference: number
): MonsterData[] {
    // Step 1: Apply party size multiplier first
    const partyMultiplier = calculateMonsterMultiplier(partySize);
    let scaledMonsters = scaleMonsterCountsByPartySize(monsters, partyMultiplier);

    // Calculate current XP
    let currentXP = recalculateXPBudget(scaledMonsters);

    // Step 2: If party is higher level, we need MORE monsters/XP
    if (levelDifference > 0 && currentXP < targetXP) {
        const xpDeficit = targetXP - currentXP;

        // Strategy: Distribute additional monsters proportionally across all monster types
        // This keeps the encounter balanced and thematic

        // Calculate total XP weight for proportional distribution
        const totalWeight = scaledMonsters.reduce((sum, m) => sum + m.exp, 0);

        if (totalWeight > 0) {
            // Distribute XP deficit proportionally based on each monster's XP contribution
            scaledMonsters = scaledMonsters.map(m => {
                if (m.exp <= 0) return m;

                // Calculate this monster's share of the deficit
                const proportion = m.exp / totalWeight;
                const xpShare = xpDeficit * proportion;

                // How many additional of this monster type do we need?
                const additionalCount = Math.max(1, Math.round(xpShare / m.exp));

                return {
                    ...m,
                    count: (m.count || 1) + additionalCount
                };
            });

            currentXP = recalculateXPBudget(scaledMonsters);
        }

        // If still under budget, try adding minions from library
        if (currentXP < targetXP * 0.8) {
            const minions = getLowCRMinions();
            if (minions.length > 0) {
                // Pick a random minion
                const randomMinion = minions[Math.floor(Math.random() * minions.length)];
                const remainingDeficit = targetXP - currentXP;
                const minionCount = Math.ceil(remainingDeficit / randomMinion.exp);

                // Check if this minion already exists in the encounter
                const existingIndex = scaledMonsters.findIndex(
                    m => m.id === randomMinion.id || m.name.toLowerCase() === randomMinion.name.toLowerCase()
                );

                if (existingIndex >= 0) {
                    // Add to existing count
                    scaledMonsters = scaledMonsters.map((m, i) => {
                        if (i === existingIndex) {
                            return { ...m, count: (m.count || 1) + minionCount };
                        }
                        return m;
                    });
                } else {
                    // Add as new monster entry
                    scaledMonsters.push({
                        ...randomMinion,
                        count: minionCount
                    });
                }
            }
        }
    }

    // Step 3: Apply swarm substitution for large monster counts
    // This replaces 8+ of a single creature type with swarm(s) + remainder
    const swarmedMonsters = substituteSwarms(scaledMonsters);

    // Step 4: If party is lower level, we might have TOO MANY monsters
    // But we don't want to reduce below the original counts, so we leave it as-is
    // The difficulty adjustment already handles this by reducing the perceived difficulty

    return swarmedMonsters;
}

// =========================================
// Main Scaling Function
// =========================================

/**
 * Main function to scale an encounter based on party configuration
 * 
 * Scaling is applied only within the same tier:
 * - If party level and encounter level are in different tiers, returns unscaled encounter
 * - If same tier, applies: XP budget scaling, monster count scaling, DC scaling, damage scaling, difficulty adjustment
 * 
 * XP Budget is recalculated based on the party's current level and size using the 2024 DMG table.
 * 
 * Returns a new encounter object with scaled values
 */
export function scaleEncounter(
    encounter: EncounterData,
    partyConfig: PartyConfig
): EncounterData {
    const levelDifference = partyConfig.averageLevel - encounter.level;

    // Check if party and encounter are in the same tier
    // If not, skip scaling entirely (encounters should only be used within their tier)
    if (!areSameTier(partyConfig.averageLevel, encounter.level)) {
        console.warn(
            `Scaling skipped: Party level ${partyConfig.averageLevel} (Tier ${getTierForLevel(partyConfig.averageLevel)}) ` +
            `and encounter level ${encounter.level} (Tier ${getTierForLevel(encounter.level)}) are in different tiers.`
        );
        return encounter;
    }

    // Scale the scalingMechanics array (applies to ALL encounter types)
    const scaledMechanics = scaleScalingMechanics(encounter.scalingMechanics, levelDifference);

    // For non-combat encounters, only scale mechanics
    if (encounter.type !== EncounterType.Combat && encounter.type !== EncounterType.Boss) {
        return {
            ...encounter,
            scalingMechanics: scaledMechanics
        };
    }

    // Combat and Boss encounters: also scale monsters, difficulty, and XP budget
    const combatEncounter = encounter as CombatEncounterData | BossEncounterData;

    // Calculate the encounter's CURRENT monster XP (before any scaling)
    const originalMonsterXP = recalculateXPBudget(combatEncounter.monsters);

    // First, apply party size multiplier to get a baseline scaled XP
    const partyMultiplier = calculateMonsterMultiplier(partyConfig.size);
    const sizeScaledXP = originalMonsterXP * partyMultiplier;

    // Determine the maximum difficulty (can increase from base but caps at High)
    // Use the old adjustDifficultyTier to get what difficulty WOULD be if we scaled up
    const maxDifficulty = adjustDifficultyTier(
        encounter.difficulty,
        encounter.level,
        partyConfig.averageLevel
    );

    // Find the best-fit difficulty based on the encounter's current XP
    // This prevents adding too many monsters by matching difficulty to what's already there
    const { difficulty: bestFitDifficulty, targetXP: targetXPBudget } = findBestFitDifficulty(
        sizeScaledXP,
        partyConfig.averageLevel,
        partyConfig.size,
        maxDifficulty
    );

    // Scale monsters to match the target XP budget
    // Since we've already found a best-fit XP, this should only add a FEW monsters if needed
    const scaledMonsters = scaleMonstersToXPBudget(
        combatEncounter.monsters,
        targetXPBudget,
        partyConfig.size,
        levelDifference
    );

    // Calculate the actual XP from scaled monsters
    const actualMonsterXP = recalculateXPBudget(scaledMonsters);

    // Log scaling info for DM reference
    console.log(
        `Encounter "${encounter.name}" scaled: ` +
        `Original=${encounter.difficulty} -> Best fit=${bestFitDifficulty}, ` +
        `Target XP=${targetXPBudget}, Actual XP=${actualMonsterXP}, ` +
        `Level diff=${levelDifference}`
    );

    // Return scaled encounter
    // Difficulty is now the BEST FIT difficulty, not necessarily what adjustDifficultyTier would return
    return {
        ...encounter,
        difficulty: bestFitDifficulty,
        monsters: scaledMonsters,
        xpBudget: actualMonsterXP, // Use actual XP since that's what the party will face
        scalingMechanics: scaledMechanics
    } as EncounterData;
}

/**
 * Check if an encounter has been scaled from its original values
 * Useful for displaying scaling indicators in the UI
 */
export function isEncounterScaled(
    originalEncounter: EncounterData,
    scaledEncounter: EncounterData
): boolean {
    // Check if scalingMechanics DCs/damage changed
    if (originalEncounter.scalingMechanics && scaledEncounter.scalingMechanics) {
        for (let i = 0; i < originalEncounter.scalingMechanics.length; i++) {
            const orig = originalEncounter.scalingMechanics[i];
            const scaled = scaledEncounter.scalingMechanics[i];
            if (orig.dc !== scaled.dc || orig.damage !== scaled.damage) return true;
        }
    }

    if (originalEncounter.type !== EncounterType.Combat && originalEncounter.type !== EncounterType.Boss) {
        return false;
    }

    const original = originalEncounter as CombatEncounterData | BossEncounterData;
    const scaled = scaledEncounter as CombatEncounterData | BossEncounterData;

    // Check if difficulty changed
    if (original.difficulty !== scaled.difficulty) return true;

    // Check if monster counts changed
    if (original.monsters.length !== scaled.monsters.length) return true;

    for (let i = 0; i < original.monsters.length; i++) {
        if (original.monsters[i].count !== scaled.monsters[i].count) return true;
    }

    return false;
}
