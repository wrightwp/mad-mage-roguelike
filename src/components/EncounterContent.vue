<script setup lang="ts">
import { ref } from 'vue';
import type { EncounterData } from '../types';
import { EncounterType } from '../types';
import CombatEncounter from './encounters/CombatEncounter.vue';
import SocialEncounter from './encounters/SocialEncounter.vue';
import ExplorationEncounter from './encounters/ExplorationEncounter.vue';
import RestEncounter from './encounters/RestEncounter.vue';
import TreasureEncounter from './encounters/TreasureEncounter.vue';
import BossEncounter from './encounters/BossEncounter.vue';

interface Props {
  encounter: EncounterData;
  showRoomDescription?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showRoomDescription: false
});

// Helper to resolve mechanic by ID
// Explicitly type 'm' to avoid implicit any if needed, though 'encounter' type should infer it.
// Actually, safely typing it as any or ScalingMechanic is better.
const getMechanic = (id: string) => {
  return props.encounter.scalingMechanics?.find((m: any) => m.id === id);
};

// Helper to parse description line into parts
const parseDescription = (text: string) => {
  const parts: { type: 'text' | 'mechanic', content: string }[] = [];
  const regex = /{{(.*?)}}/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    parts.push({ type: 'mechanic', content: match[1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex) });
  }
  return parts;
};

const showAIPrompt = ref(false);

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};
</script>

<template>
  <div class="space-y-4">
    <!-- Room Description -->
    <div v-if="showRoomDescription && encounter.roomDescription" class="bg-slate-800/30 rounded-lg p-3 border border-slate-700/40">
      <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-bold">Room Description</div>
      <p class="text-sm text-slate-300 leading-relaxed italic">
        {{ encounter.roomDescription }}
      </p>
    </div>

    <!-- Encounter Header -->
    <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <h2 class="text-lg font-bold text-amber-400 mb-3">{{ encounter.name }}</h2>
      
      <!-- DM Description -->
      <div v-if="encounter.dmDescription" class="mb-3 pb-3 border-b border-slate-700/50">
        <ul v-if="Array.isArray(encounter.dmDescription)" class="list-disc list-outside ml-4 space-y-1">
          <li v-for="(line, idx) in encounter.dmDescription" :key="idx" class="text-sm text-slate-300 leading-relaxed italic">
            <template v-for="(part, pIdx) in parseDescription(line)" :key="pIdx">
              <span v-if="part.type === 'text'">{{ part.content }}</span>
              <span v-else-if="getMechanic(part.content)" 
                class="inline-flex items-center gap-1 align-middle px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mx-1 select-none cursor-help"
                :class="{
                   'bg-red-900/60 text-red-200 border border-red-800/50': getMechanic(part.content)?.type === 'trap',
                   'bg-blue-900/60 text-blue-200 border border-blue-800/50': getMechanic(part.content)?.type === 'skill',
                   'bg-amber-900/60 text-amber-200 border border-amber-800/50': getMechanic(part.content)?.type === 'puzzle',
                   'bg-orange-900/60 text-orange-200 border border-orange-800/50': getMechanic(part.content)?.type === 'hazard',
                }"
                :title="getMechanic(part.content)?.subType"
              >
                 {{ getMechanic(part.content)?.subType || getMechanic(part.content)?.type }} :
                 <span v-if="getMechanic(part.content)?.dc" class="bg-black/30 px-1 rounded">DC {{ getMechanic(part.content)?.dc }}</span>
                 <span v-if="getMechanic(part.content)?.damage" class="ml-0.5">{{ getMechanic(part.content)?.damage }}</span>
              </span>
              <span v-else class="text-red-500 text-xs">??</span>
            </template>
          </li>
        </ul>
        <p v-else class="text-sm text-slate-300 leading-relaxed italic">{{ encounter.dmDescription }}</p>
      </div>

       <!-- Scaling Mechanics (Loop - generic fallback if not in text? Or just hide?) -->
       <!-- Hiding explicit loop as requested by "integrate into text". Leaving code for simple debugging if needed -->
       <!-- 
       <div class="flex gap-2 text-xs flex-wrap mb-3" v-if="encounter.scalingMechanics && encounter.scalingMechanics.length > 0">
          ...
       </div> 
       -->
      
      <div class="flex gap-2 text-xs flex-wrap">
        <span class="px-2 py-1 bg-slate-700 rounded">Level {{ encounter.level }}</span>
        <span class="px-2 py-1 bg-slate-700 rounded capitalize">{{ encounter.difficulty }}</span>
      </div>
    </div>

    <!-- Dynamic Encounter Details -->
    <div>
      <CombatEncounter 
        v-if="encounter.type === EncounterType.Combat" 
        :encounter="encounter" 
      />
      <SocialEncounter 
        v-else-if="encounter.type === EncounterType.Social" 
        :encounter="encounter" 
      />
      <ExplorationEncounter 
        v-else-if="encounter.type === EncounterType.Exploration" 
        :encounter="encounter" 
      />
      <RestEncounter 
        v-else-if="encounter.type === EncounterType.Rest" 
        :encounter="encounter" 
      />
      <TreasureEncounter 
        v-else-if="encounter.type === EncounterType.Treasure" 
        :encounter="encounter" 
      />
      <BossEncounter 
        v-else-if="encounter.type === EncounterType.Boss" 
        :encounter="encounter" 
      />
    </div>

    <!-- Win Conditions & Rewards -->
    <div v-if="encounter.winConditions?.length" 
      class="bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-lg p-3 border border-slate-700">
      <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-bold">
        Win Conditions
      </div>
      <div class="space-y-2">
        <div 
          v-for="(winCondition, index) in encounter.winConditions" 
          :key="index"
          class="rounded-lg p-2 border-l-4 bg-slate-900/40"
          :class="index === 0 ? 'border-emerald-500 bg-emerald-900/5' : 'border-amber-500 bg-amber-900/5'">
          <div class="mb-0">
            <div class="text-sm font-semibold mb-0.5" :class="index === 0 ? 'text-emerald-300' : 'text-amber-300'">
              <template v-for="(part, pIdx) in parseDescription(winCondition.condition)" :key="pIdx">
                <span v-if="part.type === 'text'">{{ part.content }}</span>
                <span v-else-if="getMechanic(part.content)" 
                  class="inline-flex items-center gap-1 align-middle px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mx-1 select-none cursor-help"
                  :class="{
                     'bg-red-900/60 text-red-200 border border-red-800/50': getMechanic(part.content)?.type === 'trap',
                     'bg-blue-900/60 text-blue-200 border border-blue-800/50': getMechanic(part.content)?.type === 'skill',
                     'bg-amber-900/60 text-amber-200 border border-amber-800/50': getMechanic(part.content)?.type === 'puzzle',
                     'bg-orange-900/60 text-orange-200 border border-orange-800/50': getMechanic(part.content)?.type === 'hazard',
                  }"
                  :title="getMechanic(part.content)?.subType"
                >
                   {{ getMechanic(part.content)?.subType || getMechanic(part.content)?.type }} :
                   <span v-if="getMechanic(part.content)?.dc" class="bg-black/30 px-1 rounded">DC {{ getMechanic(part.content)?.dc }}</span>
                   <span v-if="getMechanic(part.content)?.damage" class="ml-0.5">{{ getMechanic(part.content)?.damage }}</span>
                </span>
                <span v-else class="text-red-500 text-xs">??</span>
              </template>
            </div>
            
            <div class="text-xs text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
              <span class="font-semibold">Reward:</span>
              <span class="text-slate-300 mr-auto">{{ winCondition.reward }}</span>
              
              <span v-if="winCondition.xpReward" class="text-[10px] bg-indigo-900/60 text-indigo-200 px-1.5 py-0.5 rounded border border-indigo-700/50 whitespace-nowrap">
                +{{ winCondition.xpReward }} XP
              </span>
              <span v-if="winCondition.goldReward" class="text-[10px] bg-amber-900/60 text-amber-200 px-1.5 py-0.5 rounded border border-amber-700/50 whitespace-nowrap">
                +{{ winCondition.goldReward }} GP
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Room Prompt -->
    <div v-if="encounter.aiRoomPrompt" 
      class="bg-gradient-to-br from-purple-900/15 to-slate-900/30 rounded-xl border border-purple-900/40 overflow-hidden">
      <div
        class="flex items-center justify-between px-4 py-3 bg-slate-900/60 border-b border-purple-900/30 cursor-pointer select-none hover:bg-slate-900/80 transition-colors"
        @click="showAIPrompt = !showAIPrompt"
        role="button"
        tabindex="0"
        :aria-expanded="showAIPrompt"
      >
        <div class="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-purple-300">
          <span class="text-xs transition-transform" :class="showAIPrompt ? 'rotate-0' : '-rotate-90'">▼</span>
          <span>AI Room Prompt</span>
        </div>
        <button
          @click="copyToClipboard(encounter.aiRoomPrompt)"
          class="px-2.5 py-1 bg-purple-600/90 hover:bg-purple-500 text-white text-[10px] font-bold rounded-md transition-colors border border-purple-400/40"
          @click.stop
        >
          Copy
        </button>
      </div>
      <div v-show="!showAIPrompt" class="px-4 py-3 text-[11px] text-slate-400 italic">
        Prompt hidden — click to expand.
      </div>
      <div v-show="showAIPrompt" class="px-4 py-4">
        <div class="text-xs text-slate-200 bg-slate-950/50 rounded-lg p-3 border border-slate-700/40 font-mono leading-relaxed shadow-inner">
          {{ encounter.aiRoomPrompt }}
        </div>
      </div>
    </div>
  </div>
</template>
