import type { EncounterData } from '../types';
import { EncounterType, EncounterDifficulty } from '../types';
import encountersFloor01 from './encounters-floor-01.json';

export class EncounterLibrary {
    private encountersByFloor: Map<number, EncounterData[]> = new Map();

    constructor() {
        // Load encounters by floor
        this.encountersByFloor.set(1, encountersFloor01 as EncounterData[]);
        // TODO: Load floors 2-21 when encounter files are created
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
