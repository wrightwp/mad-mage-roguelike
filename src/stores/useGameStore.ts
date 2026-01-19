import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useCampaignStore } from './useCampaignStore';
import { generateDungeon } from '../logic/dungeonGen';
import type { DungeonNode, DungeonMapData } from '../types';
import type { FloorData, RunState, PartyMemberState } from '../types/Persistence';

export const useGameStore = defineStore('game', () => {
    const campaignStore = useCampaignStore();

    // Settings for generation (could be moved to args or another store)
    const layerCount = ref(15);

    // These could be derived from campaignStore.activeCampaign.currentRun
    // But for reactivity and ease of use, we might want to sync them or wrap them.
    // Ideally, we work directly on the campaign object so changes propagate.

    const currentRun = computed(() => campaignStore.activeCampaign?.currentRun);

    const hasActiveRun = computed(() => !!currentRun.value);

    const currentFloor = computed(() => {
        if (!currentRun.value) return null;
        return currentRun.value.floors[currentRun.value.currentFloorId];
    });

    const mapData = computed<DungeonMapData | null>(() => {
        if (!currentFloor.value) return null;

        const nodes = currentFloor.value.layout;
        const edges: { from: string; to: string }[] = [];

        // Reconstruct edges from connections
        nodes.forEach(node => {
            if (node.connections) {
                node.connections.forEach(targetId => {
                    edges.push({ from: node.id, to: targetId });
                });
            }
        });

        const bossNode = nodes.find(n => n.type === 'boss');

        return {
            nodes,
            edges,
            bossNodeId: bossNode?.id || '',
            currentFloor: currentFloor.value.floorNumber,
            totalFloors: 21, // Hardcoded for now
            layersPerFloor: layerCount.value
        };
    });

    // Actions
    function startRun(party: PartyMemberState[], partyLevel: number = 1) {
        if (!campaignStore.activeCampaign) return;

        // Initialize first floor
        const floorId = crypto.randomUUID();
        const floorNumber = 1;

        // Generate valid dungeon layout
        const dungeonData = generateDungeon(
            layerCount.value,
            floorNumber,
            800, // Width (should match UI)
            2000, // Height
            undefined, // Default node counts
            party.length,
            partyLevel
        );

        const newRun: RunState = {
            currentFloorId: floorId,
            floors: {},
            partyState: party,
            partyConfig: {
                size: party.length,
                level: partyLevel
            }
        };

        const firstFloor: FloorData = {
            id: floorId,
            floorNumber: floorNumber,
            layout: dungeonData.nodes,
            status: 'active',
            visitedNodes: [], // Start node?
            metrics: { goldEarned: 0, xpEarned: 0 }
        };

        // Auto-visit the start node
        const startNode = firstFloor.layout.find(n => n.type === 'start');
        if (startNode) {
            firstFloor.visitedNodes.push(startNode.id);
            startNode.status = 'current';
        }

        newRun.floors[floorId] = firstFloor;

        campaignStore.activeCampaign.currentRun = newRun;
        campaignStore.saveToLocalStorage();
    }

    function setFloorData(floorId: string, layout: DungeonNode[]) {
        if (!currentRun.value || !currentRun.value.floors[floorId]) return;
        currentRun.value.floors[floorId].layout = layout;
        campaignStore.saveToLocalStorage();
    }

    function visitNode(nodeId: string) {
        if (!currentFloor.value) return;
        if (!currentFloor.value.visitedNodes.includes(nodeId)) {
            currentFloor.value.visitedNodes.push(nodeId);

            // Find node and set status
            const node = currentFloor.value.layout.find(n => n.id === nodeId);
            if (node) {
                node.status = 'current';
            }
            campaignStore.saveToLocalStorage();
        }
    }

    function addReward(gold: number, xp: number) {
        if (!currentFloor.value) return;
        currentFloor.value.metrics.goldEarned += gold;
        currentFloor.value.metrics.xpEarned += xp;

        if (campaignStore.activeCampaign) {
            campaignStore.activeCampaign.gold += gold;
            campaignStore.activeCampaign.xp += xp;
        }
        campaignStore.saveToLocalStorage(); // Auto-save on reward
    }

    function failRun() {
        if (currentFloor.value) {
            currentFloor.value.status = 'failed';
        }
        // Move run to history?
        // TODO: Implement end run logic
        campaignStore.saveToLocalStorage();
    }

    return {
        currentRun,
        hasActiveRun,
        currentFloor,
        mapData,
        startRun,
        setFloorData,
        visitNode,
        addReward,
        failRun
    };
});
