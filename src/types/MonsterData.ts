export interface MonsterData {
    name: string;
    cr: number | string; // Challenge Rating (can be fractional like 0.125, 0.25, 0.5, or whole numbers)
    exp: number; // Experience points
    pb: number; // Proficiency Bonus
    mmLink: string; // Link to Monster Manual entry
    count?: number; // Number of this monster type in an encounter (null/undefined in general database)
}
