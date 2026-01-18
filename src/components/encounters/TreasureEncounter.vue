<script setup lang="ts">
import type { TreasureEncounterData } from '../../types/EncounterData';

defineProps<{
  encounter: TreasureEncounterData;
}>();
</script>

<template>
  <div class="bg-amber-900/10 rounded-xl p-4 border border-amber-900/30">
    <div class="flex items-center justify-between mb-3">
        <div class="text-[10px] text-amber-400 uppercase tracking-widest font-bold">Treasure Encounter</div>
        <div v-if="encounter.goldValue" class="text-xs font-bold text-amber-300 bg-amber-900/40 px-2 py-0.5 rounded border border-amber-500/30">
            {{ encounter.goldValue }} GP
        </div>
    </div>
    
    <div v-if="encounter.items && encounter.items.length" class="mb-3">
      <strong class="text-amber-300 text-sm block mb-2">Loot:</strong>
      <ul class="list-disc list-inside text-xs text-slate-300 space-y-1">
        <li v-for="item in encounter.items" :key="item">{{ item }}</li>
      </ul>
    </div>
    
    <div v-if="encounter.hasTrap" class="mt-3 bg-red-900/20 p-2 rounded border border-red-900/30">
      <strong class="text-red-400 text-xs block mb-1">⚠️ Trap Detected:</strong>
      <p class="text-xs text-red-200 indent-2">{{ encounter.trapDescription || 'Unknown Trap' }}</p>
    </div>

    <div v-if="encounter.isMimic" class="mt-3 bg-purple-900/20 p-2 rounded border border-purple-900/50 animate-pulse">
      <strong class="text-purple-400 text-xs block mb-1">👾 MIMIC ALERT:</strong>
      <p class="text-xs text-purple-200">The treasure is a monster!</p>
    </div>
    
    <div v-if="encounter.isLocked && !encounter.isMimic" class="mt-3 flex items-center gap-2 text-xs text-slate-300 bg-slate-900/40 p-2 rounded border border-slate-700/30">
      <span>🔒</span>
      <strong>Locked</strong>
      <span v-if="encounter.lockDC" class="text-slate-500">(DC {{ encounter.lockDC }})</span>
    </div>
  </div>
</template>
