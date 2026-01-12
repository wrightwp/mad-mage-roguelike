<script setup lang="ts">
import { computed } from 'vue';
import type { DungeonMapData } from '../types';
import type { ViewBox } from '../composables/useMapViewport';
import { getEdgePath } from '../utils/edgeUtils';
import HexNode from './map/HexNode.vue';
import dungeonMapBg from '../assets/dungeon_map_bg_v3.png';

interface Props {
  mapData: DungeonMapData | null;
  viewBox: ViewBox;
  selectedNodeId: string | null;
  activeEdges: Array<{ from: string; to: string }>;
  availableEdges: Array<{ from: string; to: string }>;
  revealAll: boolean;
}

interface Emits {
  (e: 'wheel', event: WheelEvent): void;
  (e: 'mousedown', event: MouseEvent): void;
  (e: 'mousemove', event: MouseEvent): void;
  (e: 'mouseup', event: MouseEvent): void;
  (e: 'mouseleave', event: MouseEvent): void;
  (e: 'nodeClick', nodeId: string): void;
  (e: 'enterEncounter', nodeId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Filter out edges that have been traversed
const untraversedEdges = computed(() => {
  if (!props.mapData) return [];
  
  return props.mapData.edges.filter(edge => {
    // Check if this edge is in the active (traversed) path
    const isTraversed = props.activeEdges.some(
      activeEdge => activeEdge.from === edge.from && activeEdge.to === edge.to
    );
    return !isTraversed;
  });
});

// Check if an edge is available for selection
const isEdgeAvailable = (edge: { from: string; to: string }) => {
  return props.availableEdges.some(
    availableEdge => availableEdge.from === edge.from && availableEdge.to === edge.to
  );
};

// Categorize untraversed edges into available and unavailable
const unavailableEdges = computed(() => {
  return untraversedEdges.value.filter(edge => !isEdgeAvailable(edge));
});

const availableUntraversedEdges = computed(() => {
  return untraversedEdges.value.filter(edge => isEdgeAvailable(edge));
});

const handleNodeClick = (nodeId: string) => {
  emit('nodeClick', nodeId);
};

const handleEnterEncounter = (nodeId: string) => {
  emit('enterEncounter', nodeId);
};
</script>

<template>
  <div 
    class="flex-1 min-w-[700px] relative flex justify-center bg-black overflow-hidden cursor-grab active:cursor-grabbing z-10"
    @wheel="emit('wheel', $event)"
    @mousedown="emit('mousedown', $event)"
    @mousemove="emit('mousemove', $event)"
    @mouseup="emit('mouseup', $event)"
    @mouseleave="emit('mouseleave', $event)"
  >
    <div class="absolute inset-0 pointer-events-none" :style="{ backgroundImage: `url(${dungeonMapBg})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.25 }"></div>
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-slate-950/80 to-black opacity-90 pointer-events-none"></div>
    
    <div class="relative h-full aspect-[800/2000] w-full shadow-2xl backdrop-blur-[2px] pointer-events-none">
      <svg 
        v-if="mapData"
        :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`"
        class="w-full h-full filter drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] pointer-events-auto"
        preserveAspectRatio="xMidYMid meet" 
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="strong-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        <!-- Unavailable grey edges -->
        <path 
          v-for="(edge, i) in unavailableEdges" 
          :key="`grey-edge-${i}`"
          :d="getEdgePath(edge, mapData, 0)" 
          class="stroke-slate-700 stroke-[2] opacity-50 fill-none"
          stroke-linecap="round"
        />

        <!-- Available gold pulsing edges -->
        <path 
          v-for="(edge, i) in availableUntraversedEdges" 
          :key="`available-edge-${i}`"
          :d="getEdgePath(edge, mapData, 10 + i % 20)" 
          stroke="#f59e0b"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
          style="filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.8));"
        >
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" />
        </path>

        <path 
          v-for="(edge, i) in activeEdges" 
          :key="`active-edge-${i}`"
          :d="getEdgePath(edge, mapData, 20 + i % 30)" 
          stroke="#ffffff"
          stroke-width="3"
          fill="none"
          stroke-dasharray="10 6"
          stroke-linecap="round"
          style="filter: drop-shadow(0 0 8px rgba(255,255,255,0.7));"
        />

        
        <!-- Nodes -->
        <HexNode
          v-for="node in mapData.nodes"
          :key="node.id"
          :node="node"
          :is-selected="selectedNodeId === node.id"
          :reveal-all="revealAll"
          @click="handleNodeClick(node.id)"
          @enter-encounter="handleEnterEncounter(node.id)"
        />
      </svg>
    </div>
  </div>
</template>
