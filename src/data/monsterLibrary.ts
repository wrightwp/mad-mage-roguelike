import type { MonsterData } from '../types';
import monstersData from './monsters.json';

export class MonsterLibrary {
    private monsters: MonsterData[] = monstersData as MonsterData[];

    /**
     * Get all monsters
     */
    getAllMonsters(): MonsterData[] {
        return this.monsters;
    }

    /**
     * Merge new monster data into the library
     * Uses ID to match and overwrite existing entries
     */
    updateMonsters(newMonsters: MonsterData[]) {
        newMonsters.forEach(newMonster => {
            const index = this.monsters.findIndex(m => m.id === newMonster.id);
            if (index !== -1) {
                // Update existing
                this.monsters[index] = newMonster;
            } else {
                // Add new
                this.monsters.push(newMonster);
            }
        });
    }

    /**
     * Get monster by exact name
     */
    getMonsterByName(name: string): MonsterData | null {
        return this.monsters.find(m => m.name.toLowerCase() === name.toLowerCase()) || null;
    }

    /**
     * Get monster by unique ID
     */
    getMonsterById(id: string): MonsterData | null {
        return this.monsters.find(m => m.id === id) || null;
    }

    /**
     * Get monsters by CR (Challenge Rating)
     * @param cr - Challenge rating to filter by
     * @param maxCR - Optional maximum CR for range queries
     */
    getMonstersByCR(cr: number | string, maxCR?: number | string): MonsterData[] {
        if (maxCR !== undefined) {
            const minCRNum = typeof cr === 'string' ? parseFloat(cr) : cr;
            const maxCRNum = typeof maxCR === 'string' ? parseFloat(maxCR) : maxCR;
            return this.monsters.filter(m => {
                const monsterCR = typeof m.cr === 'string' ? parseFloat(m.cr) : m.cr;
                return monsterCR >= minCRNum && monsterCR <= maxCRNum;
            });
        }
        return this.monsters.filter(m => m.cr === cr);
    }

    /**
     * Get monsters by experience points
     * @param minExp - Minimum experience points
     * @param maxExp - Optional maximum experience points
     */
    getMonstersByExp(minExp: number, maxExp?: number): MonsterData[] {
        if (maxExp !== undefined) {
            return this.monsters.filter(m => m.exp >= minExp && m.exp <= maxExp);
        }
        return this.monsters.filter(m => m.exp === minExp);
    }

    /**
     * Get monsters by proficiency bonus
     */
    getMonstersByPB(pb: number): MonsterData[] {
        return this.monsters.filter(m => m.pb === pb);
    }

    /**
     * Search monsters by partial name match
     */
    searchMonsters(query: string): MonsterData[] {
        const lowerQuery = query.toLowerCase();
        return this.monsters.filter(m => m.name.toLowerCase().includes(lowerQuery));
    }

    /**
     * Get random monster
     * @param options - Optional filters for CR range
     */
    getRandomMonster(options?: { minCR?: number; maxCR?: number }): MonsterData | null {
        let pool = this.monsters;

        if (options?.minCR !== undefined || options?.maxCR !== undefined) {
            const minCR = options.minCR ?? 0;
            const maxCR = options.maxCR ?? 30;
            pool = this.getMonstersByCR(minCR, maxCR);
        }

        if (pool.length === 0) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    /**
     * Get monsters suitable for a given party level
     * Uses CR as a rough guide (CR = party level ± 2)
     */
    getMonstersForPartyLevel(partyLevel: number): MonsterData[] {
        const minCR = Math.max(0, partyLevel - 2);
        const maxCR = partyLevel + 2;
        return this.getMonstersByCR(minCR, maxCR);
    }

    /**
     * Calculate total XP for a list of monster names
     */
    calculateTotalXP(monsterNames: string[]): number {
        return monsterNames.reduce((total, name) => {
            const monster = this.getMonsterByName(name);
            return total + (monster?.exp || 0);
        }, 0);
    }

    /**
     * Get total number of monsters in library
     */
    getMonsterCount(): number {
        return this.monsters.length;
    }

    /**
     * Get all unique CR values in the library
     */
    getAllCRs(): (number | string)[] {
        const crs = new Set(this.monsters.map(m => m.cr));
        return Array.from(crs).sort((a, b) => {
            const aNum = typeof a === 'string' ? parseFloat(a) : a;
            const bNum = typeof b === 'string' ? parseFloat(b) : b;
            return aNum - bNum;
        });
    }
}

export const monsterLibrary = new MonsterLibrary();
