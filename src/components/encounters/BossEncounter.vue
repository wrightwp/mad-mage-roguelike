<script setup lang="ts">
import { computed } from 'vue';
import type { BossEncounterData } from '../../types/EncounterData';

const props = defineProps<{
  encounter: BossEncounterData;
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
  <div class="relative bg-gradient-to-br from-red-950/80 to-slate-950/80 rounded-xl p-0.5 shadow-2xl shadow-red-900/20 overflow-hidden group">
    <!-- Animated Border Effect -->
    <div class="absolute inset-0 bg-gradient-to-r from-red-600/20 via-amber-500/20 to-red-600/20 animate-pulse opacity-50"></div>
    
    <div class="relative bg-slate-900/95 rounded-[11px] p-5 border border-red-500/30">
      
      <!-- Crown Icon & Header -->
      <div class="flex items-center justify-center gap-3 mb-6 relative">
        <div class="h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent flex-1"></div>
        <div class="text-3xl filter drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">👑</div>
        <div class="h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent flex-1"></div>
      </div>

      <div class="text-center mb-6">
        <h3 class="text-xs font-bold text-red-500 uppercase tracking-[0.2em] mb-1">Boss Encounter</h3>
        <h2 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 font-serif">
            {{ encounter.name }}
        </h2>
      </div>

      <!-- Boss & Minions List -->
      <div v-if="groupedMonsters.length" class="mb-6">
        <strong class="text-red-400 text-sm block mb-2 uppercase tracking-wider">Enemies</strong>
        <div class="space-y-2">
          <div v-for="(monster, index) in groupedMonsters" :key="monster.name" 
            class="flex items-center justify-between bg-slate-900/40 rounded-lg p-2 border border-slate-700/30">
            <div class="flex items-center gap-2 flex-grow min-w-0">
              <span class="text-red-300 font-bold select-none shrink-0 w-6">{{ monster.count }}</span>
              <span :class="{'text-amber-200 font-bold': index === 0}" class="text-sm text-slate-300 truncate mr-2">{{ monster.name }}</span>
              <div class="flex gap-1.5 shrink-0">
                <span v-if="monster.cr !== undefined" class="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-bold select-none whitespace-nowrap uppercase">CR {{ monster.cr }}</span>
                <span v-if="monster.exp !== undefined" class="text-[9px] bg-indigo-900/60 text-indigo-200 px-1.5 py-0.5 rounded border border-indigo-700/50 font-bold select-none whitespace-nowrap uppercase">{{ monster.exp }} XP</span>
              </div>
            </div>
            <a :href="monster.mmLink" 
              target="_blank" 
              rel="noopener noreferrer"
              class="ml-3 px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded transition-colors flex items-center gap-1 shrink-0">
              <span>📖</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Phases (If applicable) -->
       <div v-if="encounter.phases && encounter.phases.length" class="mb-4 space-y-2">
        <div class="text-[10px] text-red-400 uppercase tracking-widest font-bold text-center mb-2">Combat Phases</div>
         <div v-for="phase in encounter.phases" :key="phase.name" class="bg-red-950/20 border border-red-900/30 rounded p-3">
             <div class="flex justify-between items-center mb-1">
                 <span class="text-amber-500 font-bold text-xs">{{ phase.name }}</span>
                 <span class="text-[10px] text-red-300 bg-red-900/30 px-2 py-0.5 rounded">{{ phase.trigger }}</span>
             </div>
             <p class="text-xs text-slate-400 italic">{{ phase.description }}</p>
         </div>
       </div>

      <!-- Footer Info -->
      <div class="grid grid-cols-2 gap-2 text-xs border-t border-red-900/30 pt-4">
        <div class="bg-slate-900/50 rounded p-2 text-center border border-slate-800">
          <div class="text-slate-500 uppercase tracking-tighter text-[9px] mb-0.5 font-bold">Total / Budget XP</div>
          <div class="flex items-center justify-center gap-1.5">
            <span :class="totalMonstersXP > encounter.xpBudget ? 'text-red-400' : 'text-emerald-400'" class="font-mono font-bold">{{ totalMonstersXP }}</span>
            <span class="text-slate-700">/</span>
            <span class="text-amber-500 font-mono text-[10px]">{{ encounter.xpBudget }}</span>
          </div>
        </div>
        <div class="bg-slate-900/50 rounded p-2 text-center border border-slate-800">
          <div class="text-slate-500 uppercase tracking-wider text-[10px] mb-0.5">Attitude</div>
          <div class="text-red-400 font-medium capitalize">{{ encounter.attitude }}</div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Optional: Add tailored animations if needed */
</style>
