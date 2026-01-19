<script setup lang="ts">
import type { ExplorationEncounterData } from '../../types/EncounterData';

defineProps<{
  encounter: ExplorationEncounterData;
}>();
</script>

<template>
  <div class="bg-emerald-900/10 rounded-xl p-4 border border-emerald-900/30">
    <div class="text-[10px] text-emerald-400 uppercase tracking-widest mb-3 font-bold">Exploration Encounter</div>
    
    <div v-if="encounter.items && encounter.items.length" class="mb-3">
      <strong class="text-emerald-300 text-sm block mb-2">Items Found:</strong>
      <ul class="list-disc list-inside text-xs text-slate-300 space-y-1">
        <li v-for="item in encounter.items" :key="item">{{ item }}</li>
      </ul>
    </div>
    
    <div v-if="encounter.traps && encounter.traps.length" class="mt-3 bg-red-900/20 p-2 rounded border border-red-900/30">
      <strong class="text-red-400 text-xs block mb-2">Traps / Hazards:</strong>
      <ul class="list-disc list-inside text-xs text-red-200">
        <li v-for="trap in encounter.traps" :key="trap">{{ trap }}</li>
      </ul>
    </div>
    
    <div v-if="encounter.secretDoors" class="mt-3 flex items-center gap-2 text-xs text-amber-300 bg-amber-900/20 p-2 rounded border border-amber-900/30">
      <span>🕵️</span>
      <strong>Secret Doors Present</strong>
    </div>
  </div>
</template>
