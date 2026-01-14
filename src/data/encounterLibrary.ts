import type { EncounterData } from '../types';
import { EncounterType, EncounterDifficulty } from '../types';
import encountersData from './encounters.json';

export class EncounterLibrary {
    private encounters: EncounterData[] = encountersData as EncounterData[];

    /**
     * Get random encounter matching type and level
     * @param type - The encounter type to filter by
     * @param level - Maximum level (will select encounters at or below this level)
     * @param options - Additional filtering options
     */
    getRandomEncounter(
        type: EncounterType,
        level: number,
        options?: { difficulty?: EncounterDifficulty; excludeNames?: string[] }
    ): EncounterData | null {
        let matching = this.encounters.filter(e =>
            e.type === type &&
            e.level <= level // Can use encounters at or below current level
        );

        if (options?.difficulty) {
            matching = matching.filter(e => e.difficulty === options.difficulty);
        }

        // Exclude already-used encounter names to prevent duplicates on the same map
        if (options?.excludeNames && options.excludeNames.length > 0) {
            matching = matching.filter(e => !options.excludeNames!.includes(e.name));
        }

        if (matching.length === 0) return null;

        return matching[Math.floor(Math.random() * matching.length)];
    }

    /**
     * Get all encounters for a specific level
     */
    getEncountersByLevel(level: number): EncounterData[] {
        return this.encounters.filter(e => e.level === level);
    }

    /**
     * Get encounter by name
     */
    getEncounterByName(name: string): EncounterData | null {
        return this.encounters.find(e => e.name === name) || null;
    }

    /**
     * Get all encounters of a specific type
     */
    getEncountersByType(type: EncounterType): EncounterData[] {
        return this.encounters.filter(e => e.type === type);
    }

    /**
     * Get total number of encounters loaded
     */
    getEncounterCount(): number {
        return this.encounters.length;
    }
}

export const encounterLibrary = new EncounterLibrary();
