import { ref, computed, type Ref } from 'vue';
import type { DungeonMapData, DungeonNode } from '../types';
import { scaleEncounter } from '../utils/encounterScaling';

export const useMapInteraction = (
    mapData: Ref<DungeonMapData | null>,
    partySize: Ref<number>,
    averagePartyLevel: Ref<number>
) => {
    const selectedNodeId = ref<string | null>(null);
    const visitedPath = ref<Array<{ from: string; to: string }>>([]);

    const selectedNode = computed(() => {
        if (!mapData.value || !selectedNodeId.value) return null;
        return mapData.value.nodes.find(n => n.id === selectedNodeId.value) || null;
    });

    const activeEdges = computed(() => visitedPath.value);

    const availableEdges = computed(() => {
        if (!mapData.value) return [];
        return mapData.value.edges.filter(e => {
            const fromNode = mapData.value?.nodes.find(n => n.id === e.from);
            const toNode = mapData.value?.nodes.find(n => n.id === e.to);
            return fromNode?.status === 'visited' && toNode?.status === 'available';
        });
    });

    const handleNodeClick = (node: DungeonNode) => {
        selectedNodeId.value = node.id;
    };

    const enterEncounter = (node: DungeonNode, scrollToNode: (node: DungeonNode) => void) => {
        if (node.status !== 'available') return;

        // Apply runtime scaling to the encounter if it exists
        // Always scale from the original unscaled encounter to ensure correct scaling
        if (node.originalEncounter) {
            node.encounter = scaleEncounter(node.originalEncounter, {
                size: partySize.value,
                averageLevel: averagePartyLevel.value
            });
        }

        // Find the parent node we came from
        if (mapData.value) {
            const parentNode = mapData.value.nodes.find(n =>
                n.status === 'visited' && n.connections.includes(node.id)
            );

            if (parentNode) {
                visitedPath.value.push({ from: parentNode.id, to: node.id });
            }
        }

        // Mark this node as 'current'
        node.status = 'current';

        // Lock sibling 'available' nodes in THIS layer
        if (mapData.value) {
            mapData.value.nodes.filter(n =>
                n.layer === node.layer && n.id !== node.id && n.status === 'available'
            ).forEach(n => {
                n.status = 'locked';
            });
        }

        // Scroll Camera
        scrollToNode(node);
    };

    const completeEncounter = (node: DungeonNode) => {
        if (node.status !== 'current') return;

        // Mark this node as 'visited'
        node.status = 'visited';

        // Mark connected NEXT nodes as 'available' and reveal them
        if (mapData.value) {
            node.connections.forEach(targetId => {
                const target = mapData.value!.nodes.find(n => n.id === targetId);
                if (target && target.status === 'locked') {
                    target.status = 'available';
                    target.revealed = true;
                }
            });
        }
    };

    const resetInteraction = () => {
        visitedPath.value = [];
        selectedNodeId.value = null;

        // Auto-select the start node
        if (mapData.value) {
            const startNode = mapData.value.nodes.find(n => n.type === 'start');
            if (startNode) {
                selectedNodeId.value = startNode.id;
            }
        }
    };

    return {
        selectedNodeId,
        selectedNode,
        visitedPath,
        activeEdges,
        availableEdges,
        handleNodeClick,
        enterEncounter,
        completeEncounter,
        resetInteraction
    };
};
