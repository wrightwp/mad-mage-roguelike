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
    mmLink: monster.mmLink || 'https://www.dndbeyond.com/monsters'
  }));
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
          <span class="text-sm text-slate-300">
            <span class="text-red-300 font-bold pr-4 select-none">{{ monster.count }}</span><span>{{ monster.name }}</span>
          </span>
          <a :href="monster.mmLink" 
            target="_blank" 
            rel="noopener noreferrer"
            class="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded transition-colors">
            📖 
          </a>
        </div>
      </div>
    </div>
    
    <div v-if="encounter.xpBudget" class="text-xs text-slate-400 mb-1">
      XP Budget: {{ encounter.xpBudget }}
    </div>
    <div v-if="encounter.attitude" class="text-xs text-slate-400 mb-1">
      <strong>Attitude:</strong> <span class="capitalize">{{ encounter.attitude }}</span>
    </div>
    <div v-if="encounter.personality" class="text-xs text-slate-400">
      <strong>Personality:</strong> <span class="capitalize">{{ encounter.personality }}</span>
    </div>
  </div>
</template>
