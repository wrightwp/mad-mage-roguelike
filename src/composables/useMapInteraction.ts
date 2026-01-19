import { ref, computed, type Ref, watch } from 'vue';
import { useGameStore } from '../stores/useGameStore';
import type { DungeonMapData, DungeonNode } from '../types';
import { scaleEncounter } from '../utils/encounterScaling';

export const useMapInteraction = (
    mapData: Ref<DungeonMapData | null>,
    partySize: Ref<number>,
    averagePartyLevel: Ref<number>
) => {
    const gameStore = useGameStore();
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
        // We call the store to persist this visit
        gameStore.visitNode(node.id);

        // Optimistic UI update (the store will also update it via reactivity if it shares the object, 
        // but 'node' here is from the prop which comes from the store, so it IS the store object)
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
        // Don't just clear, rebuild from state if it exists
        reconstructPaths();
        selectedNodeId.value = null;

        // Auto-select the start node or current node
        if (mapData.value) {
            const currentNode = mapData.value.nodes.find(n => n.status === 'current');
            if (currentNode) {
                selectedNodeId.value = currentNode.id;
            } else {
                const startNode = mapData.value.nodes.find(n => n.type === 'start');
                if (startNode) {
                    selectedNodeId.value = startNode.id;
                }
            }
        }
    };

    const reconstructPaths = () => {
        visitedPath.value = [];
        if (!mapData.value) return;

        // Iterate through all nodes to find visited connections
        mapData.value.nodes.forEach(node => {
            // If a node is visited or current, we should show the path TO it
            if (node.status === 'visited' || node.status === 'current') {
                // Find active parents
                // A parent is active if it is 'visited' and connects to this node
                node.parents.forEach(parentId => {
                    const parent = mapData.value!.nodes.find(n => n.id === parentId);
                    if (parent && parent.status === 'visited') {

                        // Check if this edge is already added (avoid duplicates if any)
                        const exists = visitedPath.value.some(e => e.from === parent.id && e.to === node.id);
                        if (!exists) {
                            visitedPath.value.push({ from: parent.id, to: node.id });
                        }
                    }
                });
            }
        });
    };

    // Watch for map data changes (e.g. reload or new run) to rebuild paths
    watch(() => mapData.value, (newData) => {
        if (newData) {
            reconstructPaths();
        }
    }, { immediate: true });

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
