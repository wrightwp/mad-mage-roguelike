<script setup lang="ts">
import type { RestEncounterData } from '../../types/EncounterData';

defineProps<{
  encounter: RestEncounterData;
}>();
</script>

<template>
  <div class="bg-amber-900/10 rounded-xl p-4 border border-amber-900/30">
    <div class="text-[10px] text-amber-400 uppercase tracking-widest mb-3 font-bold">Rest Site</div>
    
    <div class="text-xs text-slate-300 mb-2">
      <strong>Shelter Quality:</strong> 
      <span class="capitalize ml-1 px-2 py-0.5 rounded" 
        :class="{
          'bg-red-900/40 text-red-300': encounter.shelterQuality === 'poor',
          'bg-amber-900/40 text-amber-300': encounter.shelterQuality === 'good',
          'bg-emerald-900/40 text-emerald-300': encounter.shelterQuality === 'secure'
        }">
        {{ encounter.shelterQuality }}
      </span>
    </div>
    
    <div v-if="encounter.healingBonus" class="mt-3 flex items-center gap-2 text-xs text-emerald-300 bg-emerald-900/20 p-2 rounded border border-emerald-900/30">
      <span>💖</span>
      <strong>Healing Bonus Available</strong>
    </div>
  </div>
</template>
