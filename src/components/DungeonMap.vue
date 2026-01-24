<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useMapViewport } from '../composables/useMapViewport';
import { useResizablePanel } from '../composables/useResizablePanel';
import { useMapInteraction } from '../composables/useMapInteraction';
import { useMapSettings } from '../composables/useMapSettings';
import LeftSidebar from './LeftSidebar.vue';
import MapCanvas from './MapCanvas.vue';
import RestartModal from './RestartModal.vue';
import FloorConfigModal from './FloorConfigModal.vue';
import FloorSummaryModal from './FloorSummaryModal.vue';
import type { FloorConfig } from './FloorConfigModal.vue';
import outerBg from '../assets/clean_dungeon_bg.png';
import { ref } from 'vue';

const showFloorSummary = ref(false);

const MAP_WIDTH = 800;
const MAP_HEIGHT = 2000;

// Composables
const {
  mapData,
  floorCount,
  currentFloor,
  nodeTypeCounts,
  revealAll,
  showRestartConfirm,
  showConfigModal,
  partySize,
  averagePartyLevel,
  restartMap,
  generateWithConfig,
  openConfigModal,
  partyLocationId,
  repairState
} = useMapSettings(
  // onInit callback calls scrollToBottom
  () => {
    if (mapData.value) {
       scrollToBottom();
    }
  }
);

// Calculate actual node counts from the generated map
const actualNodeCounts = computed(() => {
  if (!mapData.value?.nodes) {
    return {};
  }
  
  const counts: Record<string, number> = {};
  mapData.value.nodes.forEach((node: any) => {
    if (node.type !== 'boss' && node.type !== 'start') {
      counts[node.type] = (counts[node.type] || 0) + 1;
    }
  });
  
  return counts;
});

const {
  viewBox,
  scrollToBottom,
  scrollToNode,
  handleWheel,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp
} = useMapViewport(MAP_WIDTH, MAP_HEIGHT);

const {
  selectedNodeId,
  selectedNode,
  activeEdges,
  availableEdges,
  handleNodeClick,
  enterEncounter,
  completeEncounter,
  resetInteraction
} = useMapInteraction(mapData, partySize, averagePartyLevel);

const {
  leftPanelWidth,
  startResizingLeft
} = useResizablePanel();

// Don't initialize map on mount - wait for config modal
onMounted(() => {
  // Try to repair state if needed (for legacy saves)
  if (repairState) {
    repairState(); 
  }

  // Only scroll if map already exists
  if (mapData.value) {
    scrollToBottom();
  }
});

// Handlers
const handleInitMap = () => {
  resetInteraction();
  scrollToBottom();
};

const handleRegenerate = () => {
  openConfigModal(); // Open config modal instead of restart confirm
};

const handleRestartConfirm = () => {
  restartMap();
  handleInitMap();
};

const handleConfigGenerate = (config: FloorConfig) => {
  generateWithConfig(config);
  handleInitMap();
};

const handleConfigCancel = () => {
  // Only allow cancel if a map already exists
  if (mapData.value) {
    showConfigModal.value = false;
  }
};

const handleNodeClickEvent = (nodeId: string) => {
  const node = mapData.value?.nodes.find(n => n.id === nodeId);
  if (node) {
    handleNodeClick(node);
  }
};

const handleEnterEncounter = (node: any) => {
  enterEncounter(node, scrollToNode);
};
</script>

<template>
  <div class="dungeon-map-container h-screen w-full flex overflow-x-auto overflow-y-hidden font-sans relative">
    <div 
      class="fixed inset-0 z-0 bg-no-repeat pointer-events-none" 
      :style="{ 
        backgroundImage: `url(${outerBg})`,
        backgroundAttachment: 'fixed',
        backgroundSize: '2560px auto',
        backgroundPosition: 'center top'
      }"
    ></div>

    <!-- Left Sidebar -->
    <LeftSidebar
      :width="leftPanelWidth"
      :floor-count="floorCount"
      :current-floor="currentFloor"
      :reveal-all="revealAll"
      :map-data="mapData"
      :selected-node="selectedNode"
      :party-size="partySize"
      :average-party-level="averagePartyLevel"
      @update:floor-count="floorCount = $event"
      @update:current-floor="currentFloor = $event"
      @update:reveal-all="revealAll = $event"
      @update:party-size="partySize = $event"
      @update:average-party-level="averagePartyLevel = $event"
      @regenerate="handleRegenerate"
      @show-floor-summary="showFloorSummary = true"
      @enter-encounter="handleEnterEncounter"
      @complete-encounter="completeEncounter"
      @select-node="handleNodeClickEvent"
    />

    <!-- Left Resizer -->
    <div 
      class="w-1.5 h-full cursor-col-resize z-30 hover:bg-amber-500/30 transition-colors flex items-center justify-center group active:bg-amber-500/50"
      @mousedown="startResizingLeft"
    >
      <div class="w-px h-12 bg-slate-700 group-hover:bg-amber-500/50"></div>
    </div>

    <!-- Map Viewport -->
    <MapCanvas
      :map-data="mapData"
      :view-box="viewBox"
      :selected-node-id="selectedNodeId"
      :active-edges="activeEdges"
      :available-edges="availableEdges"
      :party-location-id="partyLocationId"
      :reveal-all="revealAll"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @node-click="handleNodeClickEvent"
      @enter-encounter="handleNodeClickEvent($event); handleEnterEncounter(mapData?.nodes.find(n => n.id === $event))"
    />
    
    <!-- Restart Confirmation Modal -->
    <RestartModal
      :show="showRestartConfirm"
      @confirm="handleRestartConfirm"
      @cancel="showRestartConfirm = false"
    />

    <!-- Floor Configuration Modal -->
    <FloorConfigModal
      :show="showConfigModal"
      :initial-floor="currentFloor"
      :initial-floor-depth="floorCount"
      :initial-node-counts="nodeTypeCounts"
      :actual-node-counts="actualNodeCounts"
      @generate="handleConfigGenerate"
      @cancel="handleConfigCancel"
    />

    <!-- Floor Summary Modal -->
    <FloorSummaryModal
      :show="showFloorSummary"
      @close="showFloorSummary = false"
    />
  </div>
</template>

<style scoped>
</style>
