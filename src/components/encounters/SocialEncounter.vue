<script setup lang="ts">
import { computed } from 'vue';
import type { SocialEncounterData } from '../../types/EncounterData';

const props = defineProps<{
  encounter: SocialEncounterData;
}>();

const groupedNPCs = computed(() => {
  return props.encounter.monsters.map(monster => ({
    name: monster.name,
    count: monster.count || 1,
    mmLink: monster.mmLink || 'https://www.dndbeyond.com/monsters'
  }));
});
</script>

<template>
  <div class="bg-blue-900/10 rounded-xl p-4 border border-blue-900/30">
    <div class="text-[10px] text-blue-400 uppercase tracking-widest mb-3 font-bold">Social Encounter</div>
    
    <div v-if="groupedNPCs.length" class="mb-3">
      <strong class="text-blue-300 text-sm block mb-2">NPCs:</strong>
      <div class="space-y-2">
        <div v-for="npc in groupedNPCs" :key="npc.name" 
          class="flex items-center justify-between bg-slate-900/40 rounded-lg p-2 border border-slate-700/30">
          <span class="text-sm text-slate-300">
            <span class="text-blue-300 font-bold pr-4 select-none">{{ npc.count }}</span><span>{{ npc.name }}</span>
          </span>
          <a :href="npc.mmLink" 
            target="_blank" 
            rel="noopener noreferrer"
            class="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded transition-colors">
            📖 
          </a>
        </div>
      </div>
    </div>
    
    <div class="text-xs text-slate-400 mb-1">
      <strong>Attitude:</strong> <span class="capitalize">{{ encounter.attitude }}</span>
    </div>
    <div class="text-xs text-slate-400 mb-1">
      <strong>Personality:</strong> <span class="capitalize">{{ encounter.personality }}</span>
    </div>
    
    <div v-if="encounter.questHook" class="mt-3 bg-slate-800/50 p-2 rounded">
      <strong class="text-amber-400 text-xs block mb-1">Quest Hook:</strong>
      <p class="text-xs text-slate-300 italic">{{ encounter.questHook }}</p>
    </div>

    <div v-if="encounter.tradeGoods && encounter.tradeGoods.length" class="mt-3">
      <strong class="text-emerald-400 text-xs block mb-1">Trade Goods:</strong>
      <ul class="list-disc list-inside text-xs text-slate-300">
        <li v-for="good in encounter.tradeGoods" :key="good">{{ good }}</li>
      </ul>
    </div>
  </div>
</template>
