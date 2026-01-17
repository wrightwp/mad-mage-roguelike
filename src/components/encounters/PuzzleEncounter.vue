<script setup lang="ts">
import type { PuzzleEncounterData } from '../../types/EncounterData';

defineProps<{
  encounter: PuzzleEncounterData;
}>();
</script>

<template>
  <div class="bg-purple-900/10 rounded-xl p-4 border border-purple-900/30">
    <div class="text-[10px] text-purple-400 uppercase tracking-widest mb-3 font-bold">Puzzle Encounter</div>
    
    <div class="mb-3">
      <strong class="text-purple-300 text-sm block mb-1">Description:</strong>
      <p class="text-xs text-slate-300 leading-relaxed">{{ encounter.puzzleDescription }}</p>
    </div>
    
    <div v-if="encounter.dc" class="text-xs text-slate-400 mb-1">
      <strong>DC:</strong> <span class="text-amber-400 font-bold">{{ encounter.dc }}</span>
    </div>
    
    <div v-if="encounter.solution" class="mt-3 bg-slate-900/40 p-2 rounded border border-slate-700/30">
      <strong class="text-emerald-400 text-xs block mb-1">Solution:</strong>
      <p class="text-xs text-slate-300 italic">{{ encounter.solution }}</p>
    </div>
    
    <div v-if="encounter.penalty" class="mt-3 bg-red-900/20 p-2 rounded border border-red-900/30">
      <strong class="text-red-400 text-xs block mb-1">Penalty:</strong>
      <p class="text-xs text-red-200">{{ encounter.penalty }}</p>
    </div>
  </div>
</template>
