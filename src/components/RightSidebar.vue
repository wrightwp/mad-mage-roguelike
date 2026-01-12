<script setup lang="ts">
import type { DungeonNode, DungeonMapData } from '../types';
import EncounterDetails from './EncounterDetails.vue';

interface Props {
  width: number;
  selectedNode: DungeonNode | null;
  revealAll: boolean;
  mapData: DungeonMapData | null;
}

interface Emits {
  (e: 'enterEncounter', node: DungeonNode): void;
  (e: 'completeEncounter', node: DungeonNode): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();
</script>

<template>
  <div 
    class="flex-shrink-0 flex flex-col border-l border-slate-800 bg-slate-900/95 text-slate-300 shadow-2xl z-20 backdrop-blur-md relative transform-gpu overflow-hidden"
    :style="{ width: width + 'px' }"
  >
    <!-- Header -->
    <div class="p-6 border-b border-slate-700 bg-slate-950/50">
      <h3 class="font-bold text-amber-500 mb-1 text-xs uppercase tracking-[0.2em]">Encounter Details</h3>
      <h2 class="text-xl font-bold text-slate-100 tracking-tight">
        {{ selectedNode ? ((selectedNode.revealed || revealAll || selectedNode.status === 'visited' || selectedNode.status === 'current') ? (selectedNode.type === 'start' ? 'Dungeon Entrance' : selectedNode.type === 'boss' ? 'Boss Chamber' : selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)) : 'Unknown Room') : 'No Selection' }}
      </h2>
    </div>

    <!-- Encounter Details Component -->
    <EncounterDetails
      :selected-node="selectedNode"
      :reveal-all="revealAll"
      :map-data="mapData"
      @enter-encounter="emit('enterEncounter', $event)"
      @complete-encounter="emit('completeEncounter', $event)"
    />
  </div>
</template>
