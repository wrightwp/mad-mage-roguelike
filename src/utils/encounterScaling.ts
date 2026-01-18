import type { EncounterData, CombatEncounterData, MonsterData } from '../types';
import type { BossEncounterData } from '../types/EncounterData';
import { EncounterType, EncounterDifficulty } from '../types';

export interface PartyConfig {
    size: number;        // Number of characters (1-8)
    averageLevel: number; // Average party level (1-20)
}

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
 * Scale monster counts in an encounter based on party size
 * Returns a new array of monsters with adjusted counts
 */
function scaleMonsterCounts(monsters: MonsterData[], multiplier: number): MonsterData[] {
    return monsters.map(monster => ({
        ...monster,
        count: Math.max(1, Math.round((monster.count || 1) * multiplier))
    }));
}

/**
 * Recalculate XP budget based on scaled monsters
 */
function recalculateXPBudget(monsters: MonsterData[]): number {
    return monsters.reduce((total, monster) => {
        return total + (monster.exp * (monster.count || 1));
    }, 0);
}

/**
 * Main function to scale a combat encounter based on party configuration
 * Returns a new encounter object with scaled values
 */
export function scaleEncounter(
    encounter: EncounterData,
    partyConfig: PartyConfig
): EncounterData {
    // Only scale combat and boss encounters
    if (encounter.type !== EncounterType.Combat && encounter.type !== EncounterType.Boss) {
        return encounter;
    }

    const combatEncounter = encounter as CombatEncounterData | BossEncounterData;

    // Calculate scaling factors
    const monsterMultiplier = calculateMonsterMultiplier(partyConfig.size);
    const adjustedDifficulty = adjustDifficultyTier(
        encounter.difficulty,
        encounter.level,
        partyConfig.averageLevel
    );

    // Scale monster counts
    const scaledMonsters = scaleMonsterCounts(combatEncounter.monsters, monsterMultiplier);

    // Recalculate XP budget
    const scaledXPBudget = recalculateXPBudget(scaledMonsters);

    // Return scaled encounter
    return {
        ...encounter,
        difficulty: adjustedDifficulty,
        monsters: scaledMonsters,
        xpBudget: scaledXPBudget
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
