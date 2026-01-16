/**
 * Example integration of Monster Library with Encounter System
 * This demonstrates how to use both libraries together
 */

import { encounterLibrary } from './encounterLibrary';
import { monsterLibrary } from './monsterLibrary';
import type { EncounterData, MonsterData } from '../types';
import { EncounterType, EncounterDifficulty } from '../types';



/**
 * Get a random encounter (monsters are already embedded in EncounterData)
 */
export function getEnhancedEncounter(
    type: EncounterType,
    level: number,
    options?: { difficulty?: EncounterDifficulty }
): EncounterData | null {
    return encounterLibrary.getRandomEncounter(level, type, options);
}

/**
 * Build a custom encounter from monster names
 */
export function buildCustomEncounter(
    monsterNames: string[],
    encounterType: EncounterType = EncounterType.Combat,
    level: number = 1
): EncounterData | null {
    const monsters = monsterNames
        .map(name => monsterLibrary.getMonsterByName(name))
        .filter((m): m is MonsterData => m !== null);

    if (monsters.length === 0) return null;

    const totalXP = monsters.reduce((sum, m) => sum + m.exp, 0);

    // Determine difficulty based on XP
    let difficulty: EncounterDifficulty = EncounterDifficulty.Low;
    const xpPerLevel = totalXP / level;
    if (xpPerLevel > 400) difficulty = EncounterDifficulty.High;
    else if (xpPerLevel > 200) difficulty = EncounterDifficulty.Moderate;

    return {
        name: `Custom: ${monsterNames.join(', ')}`,
        level,
        type: encounterType,
        difficulty,
        xpBudget: totalXP,
        monsters,
        roomDescription: `A custom encounter featuring ${monsterNames.join(', ')}`,
        dmDescription: `Custom encounter with ${monsters.length} monster type(s). Total XP: ${totalXP}`,
        size: 1,
        lair: false
    };
}

/**
 * Generate a random encounter for a party level with appropriate monsters
 */
export function generateRandomEncounterForLevel(
    partyLevel: number,
    encounterType: EncounterType = EncounterType.Combat
): EncounterData | null {
    // Get monsters appropriate for this level
    const suitableMonsters = monsterLibrary.getMonstersForPartyLevel(partyLevel);

    if (suitableMonsters.length === 0) return null;

    // Pick 1-3 random monsters
    const numMonsters = Math.floor(Math.random() * 3) + 1;
    const selectedMonsters: string[] = [];

    for (let i = 0; i < numMonsters; i++) {
        const monster = suitableMonsters[Math.floor(Math.random() * suitableMonsters.length)];
        selectedMonsters.push(monster.name);
    }

    return buildCustomEncounter(selectedMonsters, encounterType, partyLevel);
}

/**
 * Example usage function
 */
export function exampleUsage() {
    console.log('=== Monster Library Examples ===\n');

    // Example 1: Get enhanced encounter
    const encounter = getEnhancedEncounter(EncounterType.Combat, 1, { difficulty: EncounterDifficulty.Low });
    if (encounter) {
        console.log('Enhanced Encounter:', encounter.name);
        const totalXP = encounter.monsters?.reduce((sum, m) => sum + m.exp, 0) || 0;
        console.log('Total XP:', totalXP);
        if (encounter.monsters) {
            encounter.monsters.forEach(monster => {
                console.log(`  - ${monster.name} (CR ${monster.cr}, ${monster.exp} XP)`);
                console.log(`    ${monster.mmLink}`);
            });
        }
    }

    console.log('\n=== Custom Encounter ===\n');

    // Example 2: Build custom encounter
    const customEncounter = buildCustomEncounter(['Goblin', 'Goblin', 'Goblin Boss'], EncounterType.Combat, 2);
    if (customEncounter) {
        console.log('Custom Encounter:', customEncounter.name);
        console.log('Difficulty:', customEncounter.difficulty);
        const totalXP = customEncounter.monsters?.reduce((sum, m) => sum + m.exp, 0) || 0;
        console.log('Total XP:', totalXP);
    }

    console.log('\n=== Random Generated Encounter ===\n');

    // Example 3: Generate random encounter
    const randomEncounter = generateRandomEncounterForLevel(5);
    if (randomEncounter) {
        console.log('Random Encounter for Level 5 Party:');
        console.log('Monsters:', randomEncounter.monsters?.map(m => m.name).join(', '));
        const totalXP = randomEncounter.monsters?.reduce((sum, m) => sum + m.exp, 0) || 0;
        console.log('Total XP:', totalXP);
    }

    console.log('\n=== Monster Search ===\n');

    // Example 4: Search for specific monsters
    const dragons = monsterLibrary.searchMonsters('dragon');
    console.log(`Found ${dragons.length} dragons:`);
    dragons.slice(0, 5).forEach(d => {
        console.log(`  - ${d.name} (CR ${d.cr})`);
    });
}
