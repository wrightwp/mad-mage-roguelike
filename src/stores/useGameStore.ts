import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useCampaignStore } from './useCampaignStore';
import { generateDungeon } from '../logic/dungeonGen';
import type { DungeonNode, DungeonMapData } from '../types';
import type { FloorData, RunState, PartyMemberState } from '../types/Persistence';

export const useGameStore = defineStore('game', () => {
    const campaignStore = useCampaignStore();

    // Settings for generation (could be moved to args or another store)
    const layerCount = ref(10);

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
    function startRun(party: PartyMemberState[], partyLevel: number = 1, floorDepth?: number) {
        if (!campaignStore.activeCampaign) return;

        // Initialize first floor
        const floorId = crypto.randomUUID();
        const floorNumber = 1;

        // Update layer count if provided
        if (floorDepth) {
            layerCount.value = floorDepth;
        }

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
            metrics: { goldEarned: 0, xpEarned: 0 },
            encounterResults: {}
        };


        // Auto-complete the start node (Home/Entrance)
        const startNode = firstFloor.layout.find(n => n.type === 'start');
        if (startNode) {
            firstFloor.visitedNodes.push(startNode.id);
            startNode.status = 'visited'; // Completed, not current

            // Add empty encounter result for the start node
            firstFloor.encounterResults[startNode.id] = {
                xp: 0,
                gold: 0,
                conditions: ['Entered the Dungeon'],
                customXP: 0,
                customGold: 0
            };

            // Mark connected nodes as available
            startNode.connections.forEach(connId => {
                const connectedNode = firstFloor.layout.find(n => n.id === connId);
                if (connectedNode) {
                    connectedNode.status = 'available';
                }
            });
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

    // New: Track detailed encounter results
    function updateEncounterResult(nodeId: string, result: { xp: number; gold: number; conditions: string[]; customXP?: number; customGold?: number }) {
        if (!currentFloor.value) return;

        // Initialize map if missing (legacy save support)
        if (!currentFloor.value.encounterResults) {
            currentFloor.value.encounterResults = {};
        }

        currentFloor.value.encounterResults[nodeId] = result;

        // Recalculate floor total metrics
        recalculateMetrics();

        campaignStore.saveToLocalStorage();
    }

    // Helper to sum all results
    function recalculateMetrics() {
        if (!currentFloor.value) return;

        let totalXP = 0;
        let totalGold = 0;

        // Sum from encounter results
        if (currentFloor.value.encounterResults) {
            Object.values(currentFloor.value.encounterResults).forEach(res => {
                totalXP += (res.xp || 0) + (res.customXP || 0);
                totalGold += (res.gold || 0) + (res.customGold || 0);
            });
        }

        // Update floor metrics
        currentFloor.value.metrics.goldEarned = totalGold;
        currentFloor.value.metrics.xpEarned = totalXP;

        // Note: Global campaign gold/xp tracking might need a different approach 
        // if we allow "editing" history (subtracting previous amounts).
        // For now, let's assume Campaign XP/Gold is just a sum of all completed runs/floors?
        // Or we might drift out of sync if we only ever "add".
        // Ideally campaignStore reconstructs from history + current run.
        if (campaignStore.activeCampaign) {
            // A simple way to sync active run contribution:
            // Calculate delta? Or just let campaign be separate?
            // If we edit history, we should re-sync campaign total.
            // Complex. For now, let's just create a 'syncCampaignTotals' helper in campaign store or here.

            // Temporary simple "add" fallback for now, assuming editing is rare? 
            // Better: update metrics is fine for Floor Summary. Campaign global might drift.
            // Let's defer perfect global sync for a dedicated task if needed.
        }
    }

    // Deprecated or simplified wrapper
    function addReward(gold: number, xp: number) {
        // This is now handled via updateEncounterResult mostly.
        // Keep for backward compat or ad-hoc rewards not tied to a node?
        if (!currentFloor.value) return;
        currentFloor.value.metrics.goldEarned += gold;
        currentFloor.value.metrics.xpEarned += xp;
        campaignStore.saveToLocalStorage();
    }

    function failRun() {
        if (currentFloor.value) {
            currentFloor.value.status = 'failed';
        }
        // Move run to history?
        // TODO: Implement end run logic
        campaignStore.saveToLocalStorage();
    }

    function updatePartyConfig(size: number, level: number) {
        if (!currentRun.value) return;

        // Initialize if missing (for legacy saves)
        if (!currentRun.value.partyConfig) {
            currentRun.value.partyConfig = { size, level };
        } else {
            currentRun.value.partyConfig.size = size;
            currentRun.value.partyConfig.level = level;
        }
        campaignStore.saveToLocalStorage();
    }

    // Repair action for legacy saves or missing data
    function repairState() {
        if (!currentFloor.value) return;

        // 1. Fix missing Start Node encounter data
        const startNode = currentFloor.value.layout.find(n => n.type === 'start');
        if (startNode && !startNode.encounter) {
            console.log('Repairing Start Node encounter data...');
            startNode.encounter = {
                name: "The Yawning Portal",
                level: 1,
                difficulty: "trivial" as any, // Cast to avoid import if not available here, or 'low'
                type: "exploration" as any, // avoid circular dependency or import issues for now
                roomDescription: "The bustling tavern above the dungeon.",
                dmDescription: "The entry point.",
                size: 1,
                winConditions: [],
                xpBudget: 0
            };
            campaignStore.saveToLocalStorage();
        }

        // 2. Ensure encounterResults map exists
        if (!currentFloor.value.encounterResults) {
            currentFloor.value.encounterResults = {};
            campaignStore.saveToLocalStorage();
        }
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
        failRun,
        updatePartyConfig,
        updateEncounterResult,
        repairState
    };
});
