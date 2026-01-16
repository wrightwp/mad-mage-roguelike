<script setup lang="ts">
import { ref } from 'vue';
import type { DungeonNode, DungeonMapData } from '../types';
import EncounterDetails from './EncounterDetails.vue';
import EncounterGrid from './EncounterGrid.vue';

interface Props {
  width: number;
  selectedNode: DungeonNode | null;
  revealAll: boolean;
  mapData: DungeonMapData | null;
}

interface Emits {
  (e: 'enterEncounter', node: DungeonNode): void;
  (e: 'completeEncounter', node: DungeonNode): void;
  (e: 'selectNode', nodeId: string): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

// View toggle state
type ViewMode = 'details' | 'grid';
const activeView = ref<ViewMode>('details');

const handleSelectEncounter = (node: DungeonNode) => {
  emit('selectNode', node.id);
  activeView.value = 'details'; // Switch to details view when selecting from grid
};
</script>

<template>
  <div 
    class="flex-shrink-0 flex flex-col border-l border-slate-800 bg-slate-900/95 text-slate-300 shadow-2xl z-20 backdrop-blur-md relative transform-gpu overflow-hidden"
    :style="{ width: width + 'px' }"
  >
    <!-- Header with Tabs -->
    <div class="border-b border-slate-700 bg-slate-950/50">
      
      <!-- Tab Navigation -->
      <div class="flex border-b border-slate-800">
        <button
          @click="activeView = 'details'"
          class="flex-1 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all relative"
          :class="activeView === 'details' 
            ? 'text-amber-400 bg-slate-900/50' 
            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'"
        >
          <span class="relative z-10">Current Encounter</span>
          <div 
            v-if="activeView === 'details'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400"
          ></div>
        </button>
        <button
          @click="activeView = 'grid'"
          class="flex-1 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all relative"
          :class="activeView === 'grid' 
            ? 'text-amber-400 bg-slate-900/50' 
            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'"
        >
          <span class="relative z-10">Encounter Library</span>
          <div 
            v-if="activeView === 'grid'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400"
          ></div>
        </button>
      </div>
    </div>

    <!-- Encounter Details View -->
    <EncounterDetails
      v-if="activeView === 'details'"
      :selected-node="selectedNode"
      :reveal-all="revealAll"
      :map-data="mapData"
      @enter-encounter="emit('enterEncounter', $event)"
      @complete-encounter="emit('completeEncounter', $event)"
    />

    <!-- Encounter Grid View -->
    <EncounterGrid
      v-if="activeView === 'grid'"
      :map-data="mapData"
      :selected-node="selectedNode"
      :reveal-all="revealAll"
      @select-encounter="handleSelectEncounter"
    />
  </div>
</template>
