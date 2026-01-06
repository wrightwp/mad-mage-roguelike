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
}

export interface DungeonMapData {
    nodes: DungeonNode[];
    edges: { from: string; to: string }[];
    bossNodeId: string;
}
