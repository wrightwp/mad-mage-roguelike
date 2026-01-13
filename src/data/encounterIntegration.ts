/**
 * Example integration of Monster Library with Encounter System
 * This demonstrates how to use both libraries together
 */

import { encounterLibrary } from './encounterLibrary';
import { monsterLibrary } from './monsterLibrary';
import type { EncounterData, MonsterData } from '../types';

/**
 * Enhanced encounter with full monster details
 */
export interface EnhancedEncounter extends EncounterData {
    monsterDetails?: MonsterData[];
    totalXP?: number;
}

/**
 * Get an encounter with full monster details
 */
export function getEnhancedEncounter(
    type: EncounterData['type'],
    level: number,
    options?: { difficulty?: EncounterData['difficulty'] }
): EnhancedEncounter | null {
    const encounter = encounterLibrary.getRandomEncounter(type, level, options);

    if (!encounter) return null;

    // If it's a combat encounter with creatures, get monster details
    if (encounter.creatures) {
        const creatureNames = encounter.creatures
            .split(',')
            .map(c => c.trim());

        const monsterDetails = creatureNames
            .map(name => monsterLibrary.getMonsterByName(name))
            .filter((m): m is MonsterData => m !== null);

        const totalXP = monsterLibrary.calculateTotalXP(creatureNames);

        return {
            ...encounter,
            monsterDetails,
            totalXP
        };
    }

    return encounter;
}

/**
 * Build a custom encounter from monster names
 */
export function buildCustomEncounter(
    monsterNames: string[],
    encounterType: EncounterData['type'] = 'combat',
    level: number = 1
): EnhancedEncounter | null {
    const monsterDetails = monsterNames
        .map(name => monsterLibrary.getMonsterByName(name))
        .filter((m): m is MonsterData => m !== null);

    if (monsterDetails.length === 0) return null;

    const totalXP = monsterLibrary.calculateTotalXP(monsterNames);

    // Determine difficulty based on XP
    let difficulty: EncounterData['difficulty'] = 'low';
    const xpPerLevel = totalXP / level;
    if (xpPerLevel > 400) difficulty = 'high';
    else if (xpPerLevel > 200) difficulty = 'moderate';

    return {
        name: `Custom: ${monsterNames.join(', ')}`,
        level,
        type: encounterType,
        difficulty,
        xpBudget: totalXP,
        creatures: monsterNames.join(', '),
        roomDescription: `A custom encounter featuring ${monsterNames.join(', ')}`,
        dmDescription: `Custom encounter with ${monsterDetails.length} monster type(s). Total XP: ${totalXP}`,
        size: 1,
        lair: false,
        monsterDetails,
        totalXP
    };
}

/**
 * Generate a random encounter for a party level with appropriate monsters
 */
export function generateRandomEncounterForLevel(
    partyLevel: number,
    encounterType: EncounterData['type'] = 'combat'
): EnhancedEncounter | null {
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
    const encounter = getEnhancedEncounter('combat', 1, { difficulty: 'low' });
    if (encounter) {
        console.log('Enhanced Encounter:', encounter.name);
        console.log('Total XP:', encounter.totalXP);
        if (encounter.monsterDetails) {
            encounter.monsterDetails.forEach(monster => {
                console.log(`  - ${monster.name} (CR ${monster.cr}, ${monster.exp} XP)`);
                console.log(`    ${monster.mmLink}`);
            });
        }
    }

    console.log('\n=== Custom Encounter ===\n');

    // Example 2: Build custom encounter
    const customEncounter = buildCustomEncounter(['Goblin', 'Goblin', 'Goblin Boss'], 'combat', 2);
    if (customEncounter) {
        console.log('Custom Encounter:', customEncounter.name);
        console.log('Difficulty:', customEncounter.difficulty);
        console.log('Total XP:', customEncounter.totalXP);
    }

    console.log('\n=== Random Generated Encounter ===\n');

    // Example 3: Generate random encounter
    const randomEncounter = generateRandomEncounterForLevel(5);
    if (randomEncounter) {
        console.log('Random Encounter for Level 5 Party:');
        console.log('Creatures:', randomEncounter.creatures);
        console.log('Total XP:', randomEncounter.totalXP);
    }

    console.log('\n=== Monster Search ===\n');

    // Example 4: Search for specific monsters
    const dragons = monsterLibrary.searchMonsters('dragon');
    console.log(`Found ${dragons.length} dragons:`);
    dragons.slice(0, 5).forEach(d => {
        console.log(`  - ${d.name} (CR ${d.cr})`);
    });
}
