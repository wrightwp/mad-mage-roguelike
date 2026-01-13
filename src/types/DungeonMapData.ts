import type { DungeonNode } from './DungeonNode';

export interface DungeonMapData {
    nodes: DungeonNode[];
    edges: { from: string; to: string }[];
    bossNodeId: string;
}
