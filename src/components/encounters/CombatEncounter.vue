<script setup lang="ts">
import { computed } from 'vue';
import type { CombatEncounterData } from '../../types/EncounterData';

const props = defineProps<{
  encounter: CombatEncounterData;
}>();

const groupedMonsters = computed(() => {
  return props.encounter.monsters.map(monster => ({
    name: monster.name,
    count: monster.count || 1,
    mmLink: monster.mmLink || 'https://www.dndbeyond.com/monsters',
    cr: monster.cr,
    exp: monster.exp
  }));
});

const totalMonstersXP = computed(() => {
  return props.encounter.monsters.reduce((sum, m) => sum + ((m.exp || 0) * (m.count || 1)), 0);
});
</script>

<template>
  <div class="bg-red-900/10 rounded-xl p-4 border border-red-900/30">
    <div class="text-[10px] text-red-400 uppercase tracking-widest mb-3 font-bold">Combat Encounter</div>
    
    <div v-if="groupedMonsters.length" class="mb-3">
      <strong class="text-red-300 text-sm block mb-2">Enemies:</strong>
      <div class="space-y-2">
        <div v-for="monster in groupedMonsters" :key="monster.name" 
          class="flex items-center justify-between bg-slate-900/40 rounded-lg p-2 border border-slate-700/30">
          <div class="flex items-center gap-2 flex-grow min-w-0">
            <span class="text-red-300 font-bold select-none shrink-0 w-6">{{ monster.count }}</span>
            <span class="text-sm text-slate-300 truncate mr-2">{{ monster.name }}</span>
            <div class="flex gap-1.5 shrink-0">
              <span v-if="monster.cr !== undefined" class="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-bold select-none whitespace-nowrap">CR {{ monster.cr }}</span>
              <span v-if="monster.exp !== undefined" class="text-[9px] bg-indigo-900/40 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-700/30 font-bold select-none whitespace-nowrap">{{ monster.exp }} XP</span>
            </div>
          </div>
          <a :href="monster.mmLink" 
            target="_blank" 
            rel="noopener noreferrer"
            class="ml-3 px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded transition-colors flex items-center justify-center shrink-0">
            📖 
          </a>
        </div>
      </div>
    </div>
    
    <div v-if="encounter.xpBudget" class="flex justify-between items-center text-[11px] text-slate-400 p-2 bg-black/20 rounded-lg border border-slate-800/50 mb-3">
      <div class="flex items-center gap-2">
        <span class="text-slate-500 uppercase tracking-tighter font-bold">Total XP:</span>
        <span :class="totalMonstersXP > encounter.xpBudget ? 'text-red-400' : 'text-emerald-400'" class="font-mono font-bold">{{ totalMonstersXP }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-slate-500 uppercase tracking-tighter font-bold">Budget:</span>
        <span class="text-slate-300 font-mono">{{ encounter.xpBudget }}</span>
      </div>
    </div>
    <div v-if="encounter.attitude" class="text-xs text-slate-400 mb-1">
      <strong>Attitude:</strong> <span class="capitalize">{{ encounter.attitude }}</span>
    </div>
    <div v-if="encounter.personality" class="text-xs text-slate-400">
      <strong>Personality:</strong> <span class="capitalize">{{ encounter.personality }}</span>
    </div>
  </div>
</template>
