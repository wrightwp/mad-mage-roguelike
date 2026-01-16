import type { EncounterData } from './EncounterData';

export interface DungeonNode {
    id: string;
    x: number;
    y: number;
    layer: number; // Floor number (0 = bottom, N = top)
    type: 'combat' | 'rest' | 'boss' | 'start' | 'treasure' | 'puzzle' | 'social' | 'exploration';
    connections: string[]; // IDs of connected nodes in the NEXT layer
    parents: string[]; // IDs of nodes in the PREVIOUS layer (for backtracking/validation)
    status: 'locked' | 'available' | 'visited' | 'current';
    description?: string;
    revealed?: boolean;
    encounter?: EncounterData; // Full encounter data
}
