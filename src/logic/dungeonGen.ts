import { DungeonNode, DungeonMapData, EncounterType, NodeType, EncounterDifficulty } from '../types';
import { encounterLibrary } from '../data/encounterLibrary';
import { scaleEncounter, calculatePartyXPBudget } from '../utils/encounterScaling';

export const generateDungeon = (
    layersPerFloor: number = 15,
    currentFloor: number = 1,
    width: number = 800,
    height: number = 2000,
    nodeTypeCounts?: Record<string, number>,
    partySize: number = 4,
    averagePartyLevel: number = 1
): DungeonMapData => {
    // Add 1 to configured layers to account for the Start Node separately
    // The user configured "10 layers" means "10 layers of dungeon", plus the entrance.
    layersPerFloor += 1;

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
                revealed: true,
                encounter: {
                    name: "The Yawning Portal",
                    level: 1,
                    difficulty: EncounterDifficulty.Trivial,
                    type: EncounterType.Exploration,
                    roomDescription: "The bustling tavern above the dungeon.",
                    dmDescription: ["The entry point."],
                    size: 1,
                    winConditions: [],
                    xpBudget: 0
                }
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

    // 2. Prepare Counts and Configuration
    const standardNodes = layers.slice(1, layersPerFloor - 1).flat();
    const normalizedCounts = { ...(nodeTypeCounts || {}) };
    if (normalizedCounts.puzzle) {
        normalizedCounts.exploration = (normalizedCounts.exploration || 0) + normalizedCounts.puzzle;
        delete normalizedCounts.puzzle;
    }

    const maxCounts = Object.keys(normalizedCounts).length > 0
        ? normalizedCounts
        : {
            combat: 30,
            rest: 3,
            treasure: 4,
            social: 3,
            exploration: 10
        };

    const usedCounts: Record<string, number> = {
        combat: 0,
        rest: 0,
        treasure: 0,
        social: 0,
        exploration: 0
    };

    // 3. Assign Types and Encounter Data
    // Map node types to encounter types
    const encounterTypeMap: Record<string, EncounterType> = {
        [NodeType.Combat]: EncounterType.Combat,
        [NodeType.Rest]: EncounterType.Rest,
        [NodeType.Treasure]: EncounterType.Treasure,
        [NodeType.Social]: EncounterType.Social,
        [NodeType.Exploration]: EncounterType.Exploration
    };

    // Track used encounter names to prevent duplicates on the same map
    const usedEncounterNames: string[] = [];

    // Pre-calculate which LAYERS should have Rest encounters
    // based on spacing constraint (every 3-4 layers) and configured count limit
    const restLayers = new Set<number>();
    const maxRestCount = maxCounts.rest || 0;

    // Calculate which layers should have Rest nodes
    const availableLayers = layersPerFloor - 2; // Exclude start and boss layers
    let currentLayer = Math.floor(Math.random() * 2) + 3; // First rest at layer 3-4
    let placedRestCount = 0;

    while (currentLayer <= availableLayers && placedRestCount < maxRestCount) {
        restLayers.add(currentLayer);
        placedRestCount++;
        currentLayer += Math.floor(Math.random() * 2) + 3; // Next rest 3-4 layers later
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

    // Determine nodes that are NOT designated as the layer's Rest node
    const restNodes: DungeonNode[] = [];
    const otherNodes: DungeonNode[] = [];

    standardNodes.forEach((node) => {
        if (restLayers.has(node.layer)) {
            const layerNodes = standardNodes.filter(n => n.layer === node.layer);
            const nodeIndexInLayer = layerNodes.indexOf(node);
            const selectedRestIndex = restNodeIndices.get(node.layer);

            if (nodeIndexInLayer === selectedRestIndex) {
                restNodes.push(node);
                return;
            }
        }
        otherNodes.push(node);
    });

    // Populate the type pool for the 'otherNodes' with weighting and max checks
    const otherTypesPool: NodeType[] = [];
    const poolUsedCounts = { ...usedCounts };
    // Rests used in restNodes already count towards the total
    poolUsedCounts.rest = restNodes.length;

    while (otherTypesPool.length < otherNodes.length) {
        const candidates: { type: NodeType; weight: number }[] = [];

        Object.entries(maxCounts).forEach(([type, max]) => {
            if (type !== 'boss' && type !== 'start' && type !== NodeType.Rest) {
                const current = poolUsedCounts[type] || 0;
                // Non-combat types strictly respect their max
                // Combat is always a candidate (can go over max as fallback)
                if (type === NodeType.Combat) {
                    // Combat always available, but with lower weight if under max
                    const weight = current < max ? 1 : 0.5; // Lower priority when over max
                    candidates.push({ type: type as NodeType, weight });
                } else if (current < max) {
                    // Non-combat types only available if under max
                    const weight = 2; // Higher priority for non-combat
                    candidates.push({ type: type as NodeType, weight });
                }
            }
        });

        if (candidates.length === 0) {
            // Fallback to Combat if somehow no candidates (shouldn't happen since Combat is always added)
            otherTypesPool.push(NodeType.Combat);
            poolUsedCounts.combat++;
        } else {
            const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
            let random = Math.random() * totalWeight;
            let selectedType = candidates[0].type; // Default to first candidate

            for (const candidate of candidates) {
                random -= candidate.weight;
                if (random <= 0) {
                    selectedType = candidate.type;
                    break;
                }
            }
            otherTypesPool.push(selectedType);
            poolUsedCounts[selectedType]++;
        }
    }

    // Shuffle otherTypesPool to ensure dispersion
    for (let i = otherTypesPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherTypesPool[i], otherTypesPool[j]] = [otherTypesPool[j], otherTypesPool[i]];
    }

    // Assign Rest types
    restNodes.forEach(node => {
        node.type = NodeType.Rest;
        usedCounts.rest++;
    });

    // Assign shuffled other types
    otherNodes.forEach((node, idx) => {
        node.type = otherTypesPool[idx];
        usedCounts[node.type]++;
    });

    // Calculate the maximum XP budget for encounter selection (2x party's High budget)
    // This ensures encounters can scale properly without being too far outside the party's capability
    const partyHighBudget = calculatePartyXPBudget(averagePartyLevel, partySize, EncounterDifficulty.High);
    const maxXPBudget = partyHighBudget * 2;

    // Final pass for encounter data assignment
    standardNodes.forEach((node) => {
        // Get encounter type for this node
        const encounterType = encounterTypeMap[node.type] || EncounterType.Combat;

        // Get appropriate encounter for party level (determines tier), excluding already-used encounters
        // Also filter by maxXPBudget to ensure encounters are within scaling range
        let encounter = encounterLibrary.getRandomEncounter(
            averagePartyLevel,
            encounterType,
            { excludeNames: usedEncounterNames, maxXPBudget }
        );

        if (encounter) {
            // Store the original unscaled encounter
            node.originalEncounter = encounter;

            // Apply scaling for combat encounters
            encounter = scaleEncounter(encounter, { size: partySize, averageLevel: averagePartyLevel });

            node.encounter = encounter;
            node.description = encounter.roomDescription;
            usedEncounterNames.push(encounter.name);
        } else {
            // Fallback descriptions if no encounter found
            switch (node.type) {
                case 'combat': node.description = 'A group of monsters blocks your path.'; break;
                case 'rest': node.description = 'A relatively safe spot to catch your breath and mend your wounds.'; break;
                case 'treasure': node.description = 'A glimmering chest lies half-buried in the shadows.'; break;
                case 'social': node.description = 'You encounter someone who may be friend or foe.'; break;
                case 'exploration': node.description = 'An area of interest beckons for exploration.'; break;
            }
        }
    });

    // Special handling for Boss Node
    const bossNode = layers[layersPerFloor - 1][0];
    if (bossNode && bossNode.type === NodeType.Boss) {
        let bossEncounter = encounterLibrary.getRandomEncounter(averagePartyLevel, EncounterType.Boss, { maxXPBudget });

        // Fallback to High Difficulty Combat if no Boss encounter found
        if (!bossEncounter) {
            console.warn('No Boss encounter found, falling back to High Difficulty Combat');
            bossEncounter = encounterLibrary.getRandomEncounter(
                averagePartyLevel,
                EncounterType.Combat,
                { difficulty: EncounterDifficulty.High, maxXPBudget }
            ) as any; // Cast as any because we're assigning a Combat encounter to a slot meant for Boss type logically, though the field is generic EncounterData

            // If even that fails, we can't do much, but the system handles null encounter.
        }

        if (bossEncounter) {
            // Store the original unscaled encounter
            bossNode.originalEncounter = bossEncounter;

            // Apply scaling for boss encounters
            bossEncounter = scaleEncounter(bossEncounter, { size: partySize, averageLevel: averagePartyLevel });

            bossNode.encounter = bossEncounter;
            bossNode.description = bossEncounter.roomDescription;
        }
    }

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
