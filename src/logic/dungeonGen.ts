import { DungeonNode, DungeonMapData } from '../types';

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
                status: 'available',
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

    // 3. Assign Types and Descriptions
    const MONSTER_ENCOUNTERS = ['Goblins', 'Bugbears', 'Skeletons', 'Zombies', 'Orcs', 'Hobgoblins', 'Giant Spiders'];
    const ELITE_ENCOUNTERS = ['Beholder Zombie', 'Mind Flayer', 'Ogre Chieftain', 'Wraith', 'Flesh Golem'];
    const EVENT_ENCOUNTERS = ['A mysterious fountain', 'A riddle engraved on a wall', 'A dying explorer', 'A localized magical storm'];

    standardNodes.forEach((node, idx) => {
        if (idx < typePool.length) {
            node.type = typePool[idx];
        } else {
            node.type = 'monster'; // Default filler
        }

        // Add Descriptions
        switch (node.type) {
            case 'monster':
                node.description = `A group of ${MONSTER_ENCOUNTERS[Math.floor(Math.random() * MONSTER_ENCOUNTERS.length)]} blocks your path.`;
                break;
            case 'elite':
                node.description = `A dangerous ${ELITE_ENCOUNTERS[Math.floor(Math.random() * ELITE_ENCOUNTERS.length)]} lurks here.`;
                break;
            case 'event':
                node.description = EVENT_ENCOUNTERS[Math.floor(Math.random() * EVENT_ENCOUNTERS.length)];
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
