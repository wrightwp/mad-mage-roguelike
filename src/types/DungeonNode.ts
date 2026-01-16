import type { EncounterData } from './EncounterData';
import { NodeType } from './NodeType';

export interface DungeonNode {
    id: string;
    x: number;
    y: number;
    layer: number; // Vertical position within floor (0 = start, N = boss)
    type: NodeType;
    connections: string[]; // IDs of connected nodes in the NEXT layer
    parents: string[]; // IDs of nodes in the PREVIOUS layer (for backtracking/validation)
    status: 'locked' | 'available' | 'visited' | 'current';
    description?: string;
    revealed?: boolean;
    encounter?: EncounterData; // Full encounter data
}
