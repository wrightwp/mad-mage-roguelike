export interface EncounterData {
    name: string;
    level: number;
    type: 'combat' | 'exploration' | 'social' | 'puzzle';
    difficulty: 'low' | 'moderate' | 'high';
    xpBudget: number | false; // FALSE for non-combat encounters
    creatures?: string; // Comma-separated list
    attitude?: 'hostile' | 'indifferent' | 'friendly';
    personality?: string; // cowardly, greedy, boastful, etc.
    description: string;
    size: number; // Number of rooms/areas
    winConditionA?: string;
    rewardA?: string;
    winConditionB?: string;
    rewardB?: string;
    aiRoomPrompt?: string; // For battle map generation
    lair: boolean; // Is this a lair encounter?
}

export interface MonsterData {
    name: string;
    cr: number | string; // Challenge Rating (can be fractional like 0.125, 0.25, 0.5, or whole numbers)
    exp: number; // Experience points
    pb: number; // Proficiency Bonus
    mmLink: string; // Link to Monster Manual entry
}

export interface DungeonNode {
    id: string;
    x: number;
    y: number;
    layer: number; // Floor number (0 = bottom, N = top)
    type: 'monster' | 'elite' | 'event' | 'rest' | 'boss' | 'start' | 'treasure' | 'puzzle' | 'shop';
    connections: string[]; // IDs of connected nodes in the NEXT layer
    parents: string[]; // IDs of nodes in the PREVIOUS layer (for backtracking/validation)
    status: 'locked' | 'available' | 'visited' | 'current';
    description?: string;
    revealed?: boolean;
    encounter?: EncounterData; // Full encounter data
}

export interface DungeonMapData {
    nodes: DungeonNode[];
    edges: { from: string; to: string }[];
    bossNodeId: string;
}
