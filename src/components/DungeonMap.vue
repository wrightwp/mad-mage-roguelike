<script setup lang="ts">
import { onMounted } from 'vue';
import { useMapViewport } from '../composables/useMapViewport';
import { useResizablePanel } from '../composables/useResizablePanel';
import { useMapInteraction } from '../composables/useMapInteraction';
import { useMapSettings } from '../composables/useMapSettings';
import LeftSidebar from './LeftSidebar.vue';
import RightSidebar from './RightSidebar.vue';
import MapCanvas from './MapCanvas.vue';
import RestartModal from './RestartModal.vue';
import outerBg from '../assets/clean_dungeon_bg.png';

const MAP_WIDTH = 800;
const MAP_HEIGHT = 2000;

// Composables
const {
  mapData,
  floorCount,
  nodeTypeCounts,
  revealAll,
  showRestartConfirm,
  initMap,
  restartMap
} = useMapSettings(MAP_WIDTH, MAP_HEIGHT);

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
} = useMapInteraction(mapData);

const {
  leftPanelWidth,
  rightPanelWidth,
  startResizingLeft,
  startResizingRight
} = useResizablePanel();

// Initialize map on mount
onMounted(() => {
  initMap();
  resetInteraction();
  scrollToBottom();
});

// Handlers
const handleInitMap = () => {
  resetInteraction();
  scrollToBottom();
};

const handleRegenerate = () => {
  showRestartConfirm.value = true;
};

const handleRestartConfirm = () => {
  restartMap();
  handleInitMap();
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
      :node-type-counts="nodeTypeCounts"
      :floor-count="floorCount"
      :reveal-all="revealAll"
      @update:node-type-counts="nodeTypeCounts = $event"
      @update:floor-count="floorCount = $event"
      @update:reveal-all="revealAll = $event"
      @regenerate="handleRegenerate"
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
      :reveal-all="revealAll"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @node-click="handleNodeClickEvent"
      @enter-encounter="handleNodeClickEvent($event); handleEnterEncounter(mapData?.nodes.find(n => n.id === $event))"
    />

    <!-- Right Resizer -->
    <div 
      class="w-1.5 h-full cursor-col-resize z-30 hover:bg-amber-500/30 transition-colors flex items-center justify-center group active:bg-amber-500/50"
      @mousedown="startResizingRight"
    >
      <div class="w-px h-12 bg-slate-700 group-hover:bg-amber-500/50"></div>
    </div>

    <!-- Right Sidebar -->
    <RightSidebar
      :width="rightPanelWidth"
      :selected-node="selectedNode"
      :reveal-all="revealAll"
      :map-data="mapData"
      @enter-encounter="handleEnterEncounter"
      @complete-encounter="completeEncounter"
      @select-node="handleNodeClickEvent"
    />
    
    <!-- Restart Confirmation Modal -->
    <RestartModal
      :show="showRestartConfirm"
      @confirm="handleRestartConfirm"
      @cancel="showRestartConfirm = false"
    />
  </div>
</template>

<style scoped>
</style>
