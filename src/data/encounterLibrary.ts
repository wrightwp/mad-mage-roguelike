import type { EncounterData } from '../types';
import { EncounterType, EncounterDifficulty, EncounterAttitude } from '../types';
import encountersTier1 from './encounters-tier-1.json';
import encountersTier2 from './encounters-tier-2.json';
import encountersTier3 from './encounters-tier-3.json';
import encountersTier4 from './encounters-tier-4.json';
import { monsterLibrary } from './monsterLibrary';

export class EncounterLibrary {
    private encountersByFloor: Map<number, EncounterData[]> = new Map();

    constructor() {
        // Helper to hydrate monsters from IDs
        const hydrateEncounters = (encounters: any[]): EncounterData[] => {
            return encounters.map(enc => {
                if (!enc.monsters) return enc as EncounterData;

                const hydratedMonsters = enc.monsters.map((m: any) => {
                    // If it's already a full monster object, return it (legacy support/mixed data)
                    if (m.name && m.exp) return m;

                    // If it's a reference { id, count }
                    if (m.id) {
                        const monsterData = monsterLibrary.getMonsterById(m.id);
                        if (monsterData) {
                            return {
                                ...monsterData,
                                count: m.count || 1
                            };
                        } else {
                            console.warn(`EncounterLibrary: Could not find monster with id '${m.id}' for encounter '${enc.name}'`);
                            // Return a placeholder or the raw ref to avoid crashing, but it won't have stats
                            return {
                                id: m.id,
                                name: `Unknown (${m.id})`,
                                count: m.count || 1,
                                cr: 0,
                                exp: 0,
                                pb: 2,
                                mmLink: ''
                            };
                        }
                    }
                    return m;
                });

                return {
                    ...enc,
                    monsters: hydratedMonsters
                } as EncounterData;
            });
        };

        // Initialize encounters by tier levels
        // Tier 1: Levels 1-4
        [1, 2, 3, 4].forEach(level => this.encountersByFloor.set(level, hydrateEncounters(encountersTier1)));

        // Tier 2: Levels 5-10
        [5, 6, 7, 8, 9, 10].forEach(level => this.encountersByFloor.set(level, hydrateEncounters(encountersTier2)));

        // Tier 3: Levels 11-16
        [11, 12, 13, 14, 15, 16].forEach(level => this.encountersByFloor.set(level, hydrateEncounters(encountersTier3)));

        // Tier 4: Levels 17-20
        [17, 18, 19, 20].forEach(level => this.encountersByFloor.set(level, hydrateEncounters(encountersTier4)));
    }

    /**
     * Get random encounter for a specific floor and type
     * @param floor - The floor number (CR level) to get encounters from
     * @param type - The encounter type to filter by
     * @param options - Additional filtering options
     */
    getRandomEncounter(
        floor: number,
        type: EncounterType,
        options?: { difficulty?: EncounterDifficulty; excludeNames?: string[] }
    ): EncounterData | null {
        // Hardcoded Default Encounters to ensure availability
        const DEFAULT_ENCOUNTERS: Partial<Record<EncounterType, EncounterData>> = {
            [EncounterType.Social]: {
                name: "Default Social",
                level: 0,
                type: EncounterType.Social,
                difficulty: EncounterDifficulty.Moderate,
                roomDescription: "You encounter a weary traveler resting near a small campfire.",
                dmDescription: ["Generic social encounter. The traveler shares rumors."],
                size: 1,
                monsters: [],
                attitude: EncounterAttitude.Indifferent,
                personality: "weary"
            },
            [EncounterType.Exploration]: {
                name: "Default Exploration",
                level: 0,
                type: EncounterType.Exploration,
                difficulty: EncounterDifficulty.Moderate,
                roomDescription: "This room contains interesting architectural features and dusty corners to investigate.",
                dmDescription: ["Generic exploration. DC 12 Investigation for small loot."],
                size: 1,
                items: ["Torch", "Rope"]
            },
            [EncounterType.Rest]: {
                name: "Default Rest",
                level: 0,
                type: EncounterType.Rest,
                difficulty: EncounterDifficulty.Low,
                roomDescription: "A quiet, dry alcove that seems safe enough for a short respite.",
                dmDescription: ["Generic rest area. Safe for short rest."],
                size: 1,
                shelterQuality: "poor"
            },
            [EncounterType.Treasure]: {
                name: "Default Treasure",
                level: 0,
                type: EncounterType.Treasure,
                difficulty: EncounterDifficulty.Moderate,
                roomDescription: "A small wooden chest sits in the corner, covered in dust.",
                dmDescription: ["Generic small treasure: 25gp."],
                size: 1,
                items: [],
                goldValue: 25,
                hasTrap: false,
                isLocked: false,
                isMimic: false,
                xpBudget: 50
            }
        };

        const floorEncounters = this.encountersByFloor.get(floor);
        if (!floorEncounters) {
            console.warn(`No encounters found for floor ${floor}`);
            return null;
        }

        let matching = floorEncounters.filter(e => e.type === type);

        if (options?.difficulty) {
            matching = matching.filter(e => e.difficulty === options.difficulty);
        }

        // Exclude already-used encounter names to prevent duplicates on the same map
        if (options?.excludeNames && options.excludeNames.length > 0) {
            matching = matching.filter(e => !options.excludeNames!.includes(e.name));
        }

        if (matching.length === 0) {
            // Fallback: Check for generic/default encounters of this type
            const defaultEncounter = DEFAULT_ENCOUNTERS[type];

            if (defaultEncounter) {
                console.log(`Using hardcoded default encounter for type ${type}`);
                return defaultEncounter;
            }

            console.warn(`No matching encounters found for floor ${floor}, type ${type}`);
            return null;
        }

        return matching[Math.floor(Math.random() * matching.length)];
    }

    /**
     * Get all encounters for a specific floor
     */
    getEncountersByFloor(floor: number): EncounterData[] {
        return this.encountersByFloor.get(floor) || [];
    }

    /**
     * Get encounter by name
     */
    getEncounterByName(name: string): EncounterData | null {
        for (const encounters of this.encountersByFloor.values()) {
            const found = encounters.find(e => e.name === name);
            if (found) return found;
        }
        return null;
    }

    /**
     * Get all encounters of a specific type across all floors
     */
    getEncountersByType(type: EncounterType): EncounterData[] {
        const results: EncounterData[] = [];
        for (const encounters of this.encountersByFloor.values()) {
            results.push(...encounters.filter(e => e.type === type));
        }
        return results;
    }

    /**
     * Get total number of encounters loaded across all floors
     */
    getEncounterCount(): number {
        let count = 0;
        for (const encounters of this.encountersByFloor.values()) {
            count += encounters.length;
        }
        return count;
    }
}

export const encounterLibrary = new EncounterLibrary();
