<script setup lang="ts">
import type { ExplorationEncounterData } from '../../types/EncounterData';

defineProps<{
  encounter: ExplorationEncounterData;
}>();
</script>

<template>
  <div class="bg-emerald-900/10 rounded-xl p-4 border border-emerald-900/30">
    <div class="text-[10px] text-emerald-400 uppercase tracking-widest mb-3 font-bold">Exploration Encounter</div>
    
    <div v-if="encounter.puzzleDescription" class="mb-3 bg-purple-900/10 rounded-lg p-3 border border-purple-900/30">
      <div class="text-[10px] text-purple-400 uppercase tracking-widest mb-2 font-bold">Puzzle Elements</div>
      <div class="mb-2">
        <strong class="text-purple-300 text-sm block mb-1">Description:</strong>
        <p class="text-xs text-slate-300 leading-relaxed">{{ encounter.puzzleDescription }}</p>
      </div>
      <div v-if="encounter.dc" class="text-xs text-slate-400 mb-1">
        <strong>DC:</strong> <span class="text-amber-400 font-bold">{{ encounter.dc }}</span>
      </div>
      <div v-if="encounter.solution" class="mt-2 bg-slate-900/40 p-2 rounded border border-slate-700/30">
        <strong class="text-emerald-400 text-xs block mb-1">Solution:</strong>
        <p class="text-xs text-slate-300 italic">{{ encounter.solution }}</p>
      </div>
      <div v-if="encounter.penalty" class="mt-2 bg-red-900/20 p-2 rounded border border-red-900/30">
        <strong class="text-red-400 text-xs block mb-1">Penalty:</strong>
        <p class="text-xs text-red-200">{{ encounter.penalty }}</p>
      </div>
    </div>

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
