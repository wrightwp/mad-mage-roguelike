import { DungeonNode, DungeonMapData, EncounterType, NodeType } from '../types';
import { encounterLibrary } from '../data/encounterLibrary';

export const generateDungeon = (
    layersPerFloor: number = 15,
    currentFloor: number = 1,
    width: number = 800,
    height: number = 2000,
    nodeTypeCounts?: Record<string, number>
): DungeonMapData => {
    const TOTAL_FLOORS = 21;
    const edges: { from: string; to: string }[] = [];

    // Config
    const NODES_PER_LAYER_MIN = 3;
    const NODES_PER_LAYER_MAX = 5;
    const LAYER_HEIGHT = (height - 200) / (layersPerFloor - 1); // 100px padding top/bottom

    // Helper to generate IDs
    const getId = (layer: number, index: number) => `l${layer}-n${index}`;

    const layers: DungeonNode[][] = [];

    // 1. Generate empty nodes in layers first
    for (let l = 0; l < layersPerFloor; l++) {
        const layerNodes: DungeonNode[] = [];

        if (l === layersPerFloor - 1) {
            // Boss Layer
            layerNodes.push({
                id: getId(l, 0),
                x: width / 2,
                y: 100,
                layer: l,
                type: NodeType.Boss,
                connections: [],
                parents: [],
                status: 'locked',
                description: 'The final confrontation with Halaster Blackcloak.',
                revealed: false
            });
        }
        else if (l === 0) {
            // Start Layer - The Yawning Portal
            layerNodes.push({
                id: getId(l, 0),
                x: width / 2,
                y: height - 100,
                layer: l,
                type: NodeType.Start,
                connections: [],
                parents: [],
                status: 'current',
                description: 'The Yawning Portal tavern bustles with adventurers and locals alike. At the center of the common room, a 40-foot-wide well plunges into darkness—the infamous entrance to Undermountain. Durnan, the proprietor, watches from behind the bar as you approach the edge. The rope ladder descends into the black depths below, and the sounds of the tavern fade as you begin your descent into the legendary dungeon of the Mad Mage.',
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
                    type: NodeType.Combat, // Default, will override below
                    connections: [],
                    parents: [],
                    status: 'locked',
                    revealed: false
                });
            }
        }
        layers.push(layerNodes);
    }

    // 2. Prepare Type Pool with weighting towards non-combat encounters
    const standardNodes = layers.slice(1, layersPerFloor - 1).flat();
    const typePool: DungeonNode['type'][] = [];

    if (nodeTypeCounts) {
        Object.entries(nodeTypeCounts).forEach(([type, count]) => {
            if (type !== 'boss' && type !== 'start') {
                // Add the base count
                for (let i = 0; i < count; i++) {
                    typePool.push(type as DungeonNode['type']);
                }

                // Weight non-combat encounters by adding duplicates (2x weighting)
                // This makes them more likely to be selected without guaranteeing them
                if (type !== NodeType.Combat) {
                    for (let i = 0; i < count; i++) {
                        typePool.push(type as DungeonNode['type']);
                    }
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
        [NodeType.Combat]: EncounterType.Combat,
        [NodeType.Puzzle]: EncounterType.Puzzle,
        [NodeType.Rest]: EncounterType.Rest,
        [NodeType.Treasure]: EncounterType.Exploration,
        [NodeType.Social]: EncounterType.Social,
        [NodeType.Exploration]: EncounterType.Exploration
    };

    // Track used encounter names to prevent duplicates on the same map
    const usedEncounterNames: string[] = [];

    // Pre-calculate which LAYERS should have Rest encounters
    // based on spacing constraint (every 3-5 layers) and configured count limit
    const restLayers = new Set<number>();

    // Count how many Rest encounters are in the type pool
    const maxRestCount = typePool.filter(t => t === NodeType.Rest).length;

    // Calculate which layers should have Rest nodes
    // Layers are 1-indexed, and we skip layer 0 (start) and last layer (boss)
    const availableLayers = layersPerFloor - 2; // Exclude start and boss layers
    let currentLayer = Math.floor(Math.random() * 2) + 2; // First rest at layer 2-3
    let restCount = 0;

    while (currentLayer <= availableLayers && restCount < maxRestCount) {
        restLayers.add(currentLayer);
        restCount++;
        currentLayer += Math.floor(Math.random() * 3) + 2; // Next rest 2-4 layers later
    }

    // Pre-select which specific node in each rest layer should be the rest node
    const restNodeIndices = new Map<number, number>();
    restLayers.forEach(layer => {
        const layerNodes = standardNodes.filter(n => n.layer === layer);
        if (layerNodes.length > 0) {
            const randomIndex = Math.floor(Math.random() * layerNodes.length);
            restNodeIndices.set(layer, randomIndex);
        }
    });

    standardNodes.forEach((node, idx) => {
        // Check if this node's layer should have a Rest encounter
        if (restLayers.has(node.layer)) {
            // Check if this is the randomly selected node for rest in this layer
            const layerNodes = standardNodes.filter(n => n.layer === node.layer);
            const nodeIndexInLayer = layerNodes.indexOf(node);
            const selectedRestIndex = restNodeIndices.get(node.layer);

            if (nodeIndexInLayer === selectedRestIndex) {
                node.type = NodeType.Rest;
            } else if (idx < typePool.length) {
                // This layer has a Rest, but this isn't the selected node
                let poolType = typePool[idx];
                if (poolType === NodeType.Rest) {
                    poolType = NodeType.Combat; // Replace rest with combat
                }
                node.type = poolType;
            } else {
                node.type = NodeType.Combat;
            }
        } else if (idx < typePool.length) {
            // Assign from pool, but skip any 'rest' types
            let poolType = typePool[idx];
            if (poolType === NodeType.Rest) {
                poolType = NodeType.Combat; // Replace rest with combat
            }
            node.type = poolType;
        } else {
            node.type = NodeType.Combat; // Default filler
        }

        // Get encounter type for this node
        const encounterType = encounterTypeMap[node.type] || EncounterType.Combat;

        // Get appropriate encounter for this floor, excluding already-used encounters
        const encounter = encounterLibrary.getRandomEncounter(
            currentFloor, // Use current floor for CR-appropriate encounters
            encounterType,
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
                case 'combat':
                    node.description = 'A group of monsters blocks your path.';
                    break;
                case 'rest':
                    node.description = 'A relatively safe spot to catch your breath and mend your wounds.';
                    break;
                case 'treasure':
                    node.description = 'A glimmering chest lies half-buried in the shadows.';
                    break;
                case 'puzzle':
                    node.description = 'An intricate mechanism or riddle prevents further progress.';
                    break;
                case 'social':
                    node.description = 'You encounter someone who may be friend or foe.';
                    break;
                case 'exploration':
                    node.description = 'An area of interest beckons for exploration.';
                    break;
            }
        }
    });

    // 4. Connect Layers
    for (let l = 0; l < layersPerFloor - 1; l++) {
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
        bossNodeId: layers[layersPerFloor - 1][0].id,
        currentFloor,
        totalFloors: TOTAL_FLOORS,
        layersPerFloor
    };
};
