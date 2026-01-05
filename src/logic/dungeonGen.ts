import { DungeonNode, DungeonMapData } from '../types';

export const generateDungeon = (floors: number = 15, width: number = 800, height: number = 2000): DungeonMapData => {
    const nodes: DungeonNode[] = [];
    const edges: { from: string; to: string }[] = [];

    // Config
    const NODES_PER_LAYER_MIN = 4;
    const NODES_PER_LAYER_MAX = 6;
    const LAYER_HEIGHT = height / floors;

    // Helper to generate IDs
    const getId = (layer: number, index: number) => `l${layer}-n${index}`;

    const layers: DungeonNode[][] = [];

    // Generate Layers (Bottom to Top)
    for (let l = 0; l < floors; l++) {
        const layerNodes: DungeonNode[] = [];

        // Boss Layer (Top)
        if (l === floors - 1) {
            const boss: DungeonNode = {
                id: getId(l, 0),
                x: width / 2,
                y: 100, // Top padding
                layer: l,
                type: 'boss',
                connections: [],
                parents: [],
                status: 'locked'
            };
            layerNodes.push(boss);
        }
        // Standard Layers
        else if (l === 0) {
            // Single Start Node at center
            layerNodes.push({
                id: getId(l, 0),
                x: width / 2,
                y: height - 100, // Bottom padding
                layer: l,
                type: 'start',
                connections: [],
                parents: [],
                status: 'available'
            });
        }
        else {
            // Layer 1 = Always 3 choices from start
            // Other layers = random 4-6
            const count = (l === 1) ? 3 : Math.floor(Math.random() * (NODES_PER_LAYER_MAX - NODES_PER_LAYER_MIN + 1)) + NODES_PER_LAYER_MIN;
            const layerWidth = width * 0.8; // utilize 80% of width
            const margin = (width - layerWidth) / 2;
            const segment = layerWidth / count;

            for (let i = 0; i < count; i++) {
                // Jitter x position
                const jitter = (Math.random() - 0.5) * (segment * 0.5);
                const x = margin + segment * i + segment / 2 + jitter;

                // Y position is consistent per layer
                const y = height - (l * LAYER_HEIGHT) - 100; // Bottom padding

                let type: DungeonNode['type'] = 'monster';
                const rand = Math.random();

                // Weighted Types
                if (rand < 0.5) type = 'monster';
                else if (rand < 0.65) type = 'event';
                else if (rand < 0.75) type = 'elite';
                else if (rand < 0.85) type = 'rest';
                else if (rand < 0.90) type = 'treasure';
                else if (rand < 0.95) type = 'shop';
                else type = 'puzzle';

                layerNodes.push({
                    id: getId(l, i),
                    x,
                    y,
                    layer: l,
                    type: type,
                    connections: [],
                    parents: [],
                    status: 'locked'
                });
            }
        }
        layers.push(layerNodes);
        nodes.push(...layerNodes);
    }

    // Connect Layers
    // We go from Layer L to L+1
    for (let l = 0; l < floors - 1; l++) {
        const currentLayer = layers[l];
        const nextLayer = layers[l + 1];

        // Ensure every node in CURRENT has at least 1 parent in NEXT (actually wait, paths go UP)
        // So every node in CURRENT needs a connection to NEXT.
        // AND every node in NEXT needs a connection from CURRENT (no orphans).

        // Strategy:
        // 1. Connect current[i] to closest nodes in nextLayer

        currentLayer.forEach(node => {
            // Find closest nodes in next layer
            const candidates = nextLayer.map(n => ({
                node: n,
                dist: Math.abs(n.x - node.x) // mainly care about horizontal alignment
            })).sort((a, b) => a.dist - b.dist);

            // Connect to 2 or 3 nodes (player gets 2-3 choices)
            const numConnections = Math.random() > 0.5 ? 3 : 2;
            // Boss layer always connects to all? Or just closest? Boss is usually single node.

            const targets = candidates.slice(0, (nextLayer.length === 1) ? 1 : Math.min(numConnections, nextLayer.length));

            targets.forEach(t => {
                node.connections.push(t.node.id);
                t.node.parents.push(node.id);
                edges.push({ from: node.id, to: t.node.id });
            });
        });

        // 2. Ensure NO ORPHANS in NEXT layer
        // (Every node in L+1 must have at least one parent in L)
        nextLayer.forEach(nextIdx => {
            if (nextIdx.parents.length === 0) {
                // Force connect to closest from previous
                const candidates = currentLayer.map(n => ({
                    node: n,
                    dist: Math.abs(n.x - nextIdx.x)
                })).sort((a, b) => a.dist - b.dist);

                const bestParent = candidates[0].node;
                bestParent.connections.push(nextIdx.id);
                nextIdx.parents.push(bestParent.id);
                edges.push({ from: bestParent.id, to: nextIdx.id });
            }
        });
    }

    return {
        nodes,
        edges,
        bossNodeId: layers[floors - 1][0].id
    };
};
