import { DungeonNode, DungeonMapData, EncounterType } from '../types';
import { encounterLibrary } from '../data/encounterLibrary';

export const generateDungeon = (
    floors: number = 15,
    width: number = 800,
    height: number = 2000,
    nodeTypeCounts?: Record<string, number>
): DungeonMapData => {
    const edges: { from: string; to: string }[] = [];

    // Config
    const NODES_PER_LAYER_MIN = 4;
    const NODES_PER_LAYER_MAX = 6;
    const LAYER_HEIGHT = (height - 200) / (floors - 1); // 100px padding top/bottom

    // Helper to generate IDs
    const getId = (layer: number, index: number) => `l${layer}-n${index}`;

    const layers: DungeonNode[][] = [];

    // 1. Generate empty nodes in layers first
    for (let l = 0; l < floors; l++) {
        const layerNodes: DungeonNode[] = [];

        if (l === floors - 1) {
            // Boss Layer
            layerNodes.push({
                id: getId(l, 0),
                x: width / 2,
                y: 100,
                layer: l,
                type: 'boss',
                connections: [],
                parents: [],
                status: 'locked',
                description: 'The final confrontation with Halaster Blackcloak.',
                revealed: false
            });
        }
        else if (l === 0) {
            // Start Layer
            layerNodes.push({
                id: getId(l, 0),
                x: width / 2,
                y: height - 100,
                layer: l,
                type: 'start',
                connections: [],
                parents: [],
                status: 'current',
                description: 'You stand at the entrance of the Undermountain.',
                revealed: true
            });
        }
        else {
            const count = (l === 1) ? 3 : Math.floor(Math.random() * (NODES_PER_LAYER_MAX - NODES_PER_LAYER_MIN + 1)) + NODES_PER_LAYER_MIN;
            const shadowWidth = width * 0.8;
            const margin = (width - shadowWidth) / 2;
            const segment = shadowWidth / count;

            for (let i = 0; i < count; i++) {
                const jitter = (Math.random() - 0.5) * (segment * 0.5);
                const x = margin + segment * i + segment / 2 + jitter;
                const y = height - (l * LAYER_HEIGHT) - 100;

                layerNodes.push({
                    id: getId(l, i),
                    x,
                    y,
                    layer: l,
                    type: 'monster', // Default, will override below
                    connections: [],
                    parents: [],
                    status: 'locked',
                    revealed: false
                });
            }
        }
        layers.push(layerNodes);
    }

    // 2. Prepare Type Pool
    const standardNodes = layers.slice(1, floors - 1).flat();
    const typePool: DungeonNode['type'][] = [];

    if (nodeTypeCounts) {
        Object.entries(nodeTypeCounts).forEach(([type, count]) => {
            if (type !== 'boss' && type !== 'start') {
                for (let i = 0; i < count; i++) {
                    typePool.push(type as DungeonNode['type']);
                }
            }
        });
    }

    // Shuffle Pool
    for (let i = typePool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [typePool[i], typePool[j]] = [typePool[j], typePool[i]];
    }

    // 3. Assign Types and Encounter Data
    // Map node types to encounter types
    const encounterTypeMap: Record<string, EncounterType> = {
        'monster': EncounterType.Combat,
        'elite': EncounterType.Combat,
        'event': EncounterType.Exploration,
        'puzzle': EncounterType.Puzzle,
        'shop': EncounterType.Social,
        'treasure': EncounterType.Exploration,
        'rest': EncounterType.Exploration
    };

    // Track used encounter names to prevent duplicates on the same map
    const usedEncounterNames: string[] = [];

    standardNodes.forEach((node, idx) => {
        if (idx < typePool.length) {
            node.type = typePool[idx];
        } else {
            node.type = 'monster'; // Default filler
        }

        // Get encounter type for this node
        const encounterType = encounterTypeMap[node.type] || EncounterType.Combat;

        // Get appropriate encounter for this level, excluding already-used encounters
        const encounter = encounterLibrary.getRandomEncounter(
            encounterType,
            node.layer, // Use layer as level
            { excludeNames: usedEncounterNames }
        );

        if (encounter) {
            node.encounter = encounter;
            node.description = encounter.roomDescription;
            // Track this encounter name to prevent duplicates
            usedEncounterNames.push(encounter.name);
        } else {
            // Fallback descriptions if no encounter found
            switch (node.type) {
                case 'monster':
                    node.description = 'A group of monsters blocks your path.';
                    break;
                case 'elite':
                    node.description = 'A dangerous elite creature lurks here.';
                    break;
                case 'event':
                    node.description = 'A mysterious event awaits.';
                    break;
                case 'rest':
                    node.description = 'A relatively safe spot to catch your breath and mend your wounds.';
                    break;
                case 'treasure':
                    node.description = 'A glimmering chest lies half-buried in the shadows.';
                    break;
                case 'shop':
                    node.description = 'A strange merchant has set up a small stall here.';
                    break;
                case 'puzzle':
                    node.description = 'An intricate mechanism or riddle prevents further progress.';
                    break;
            }
        }
    });

    // 4. Connect Layers
    for (let l = 0; l < floors - 1; l++) {
        const currentLayer = layers[l];
        const nextLayer = layers[l + 1];

        currentLayer.forEach(node => {
            const candidates = nextLayer.map(n => ({
                node: n,
                dist: Math.abs(n.x - node.x)
            })).sort((a, b) => a.dist - b.dist);

            const numConnections = Math.random() > 0.5 ? 3 : 2;
            const targets = candidates.slice(0, (nextLayer.length === 1) ? 1 : Math.min(numConnections, nextLayer.length));

            targets.forEach(t => {
                node.connections.push(t.node.id);
                t.node.parents.push(node.id);
                edges.push({ from: node.id, to: t.node.id });
            });
        });

        nextLayer.forEach(nextIdx => {
            if (nextIdx.parents.length === 0) {
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
        nodes: layers.flat(),
        edges,
        bossNodeId: layers[floors - 1][0].id
    };
};
