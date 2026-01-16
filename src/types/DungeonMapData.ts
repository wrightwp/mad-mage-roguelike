import type { DungeonNode } from './DungeonNode';

export interface DungeonMapData {
    nodes: DungeonNode[];
    edges: { from: string; to: string }[];
    bossNodeId: string;
    currentFloor: number; // Which floor this map represents (1-21)
    totalFloors: number; // Total floors in dungeon (21)
    layersPerFloor: number; // Layers on this floor (Floor Depth setting)
}
