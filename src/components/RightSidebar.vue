<script setup lang="ts">
import type { DungeonNode } from '../types';
import { getNodeColor, getNodeIcon } from '../utils/nodeStyles';

interface Props {
  width: number;
  selectedNode: DungeonNode | null;
  revealAll: boolean;
}

interface Emits {
  (e: 'enterEncounter', node: DungeonNode): void;
  (e: 'completeEncounter', node: DungeonNode): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();
</script>

<template>
  <div 
    class="flex-shrink-0 flex flex-col border-l border-slate-800 bg-slate-900/95 text-slate-300 shadow-2xl z-20 backdrop-blur-md relative transform-gpu overflow-hidden"
    :style="{ width: width + 'px' }"
  >
    <div class="p-6 border-b border-slate-700 bg-slate-950/50">
      <h3 class="font-bold text-amber-500 mb-1 text-xs uppercase tracking-[0.2em]">Encounter Details</h3>
      <h2 class="text-xl font-bold text-slate-100 tracking-tight">
        {{ selectedNode ? ((selectedNode.revealed || revealAll || selectedNode.status === 'visited' || selectedNode.status === 'current') ? (selectedNode.type === 'start' ? 'Dungeon Entrance' : selectedNode.type === 'boss' ? 'Boss Chamber' : selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)) : 'Unknown Room') : 'No Selection' }}
      </h2>
    </div>

    <div v-if="selectedNode" class="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
      <!-- Icon Display -->
      <div class="flex justify-center py-4">
        <div class="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl shadow-2xl border-2 border-white/10 relative overflow-hidden" :style="{ backgroundColor: (selectedNode.revealed || revealAll || selectedNode.status === 'visited' || selectedNode.status === 'current') ? getNodeColor(selectedNode.type) : '#1e293b' }">
          <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
          <template v-if="selectedNode.revealed || revealAll || selectedNode.status === 'visited' || selectedNode.status === 'current'">
            <span v-if="selectedNode.type !== 'rest'" class="relative z-10 filter drop-shadow-lg">{{ getNodeIcon(selectedNode.type) }}</span>
            <!-- Larger Campfire for Panel -->
            <svg v-else viewBox="-30 -40 60 60" class="w-20 h-20 relative z-10 drop-shadow-xl">
              <rect x="-24" y="8" width="48" height="8" rx="2" fill="#5d4037" transform="rotate(-15)" />
              <rect x="-24" y="8" width="48" height="8" rx="2" fill="#4e342e" transform="rotate(15)" />
              <rect x="-20" y="4" width="40" height="8" rx="2" fill="#3e2723" />
              <path d="M -15 4 Q -20 -15 0 -35 Q 20 -15 15 4 Z" fill="#ef4444" />
              <path d="M -10 4 Q -15 -10 0 -25 Q 15 -10 10 4 Z" fill="#f59e0b" />
            </svg>
          </template>
          <span v-else class="text-slate-600 text-6xl">?</span>
        </div>
      </div>

      <!-- Stats/Info -->
      <div class="space-y-4">
        <div class="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
          <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Description</div>
          <p class="text-sm text-slate-200 leading-relaxed font-serif italic">
            {{ (selectedNode.revealed || revealAll || selectedNode.status === 'visited' || selectedNode.status === 'current') ? (selectedNode.description || 'A mysterious chamber hidden deep within the Undermountain.') : 'The mysteries of this chamber are yet to be revealed...' }}
          </p>
        </div>

        <!-- Encounter Header (if encounter data exists) -->
        <div v-if="selectedNode.encounter && (selectedNode.revealed || revealAll || selectedNode.status === 'visited' || selectedNode.status === 'current')" class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h2 class="text-lg font-bold text-amber-400">{{ selectedNode.encounter.name }}</h2>
          <div class="flex gap-2 mt-2 text-xs">
            <span class="px-2 py-1 bg-slate-700 rounded">Level {{ selectedNode.encounter.level }}</span>
            <span class="px-2 py-1 bg-slate-700 rounded capitalize">{{ selectedNode.encounter.type }}</span>
            <span class="px-2 py-1 bg-slate-700 rounded capitalize">{{ selectedNode.encounter.difficulty }}</span>
          </div>
        </div>

        <!-- Combat Details -->
        <div v-if="selectedNode.encounter && selectedNode.encounter.type === 'combat' && (selectedNode.revealed || revealAll || selectedNode.status === 'visited' || selectedNode.status === 'current')" class="bg-red-900/10 rounded-xl p-4 border border-red-900/30">
          <div class="text-[10px] text-red-400 uppercase tracking-widest mb-2 font-bold">Combat Encounter</div>
          <div v-if="selectedNode.encounter.creatures" class="text-sm text-slate-300 mb-2">
            <strong class="text-red-300">Enemies:</strong> {{ selectedNode.encounter.creatures }}
          </div>
          <div v-if="selectedNode.encounter.xpBudget" class="text-xs text-slate-400 mb-1">
            XP Budget: {{ selectedNode.encounter.xpBudget }}
          </div>
          <div v-if="selectedNode.encounter.attitude" class="text-xs text-slate-400 mb-1">
            <strong>Attitude:</strong> <span class="capitalize">{{ selectedNode.encounter.attitude }}</span>
          </div>
          <div v-if="selectedNode.encounter.personality" class="text-xs text-slate-400">
            <strong>Personality:</strong> <span class="capitalize">{{ selectedNode.encounter.personality }}</span>
          </div>
        </div>

        <!-- Win Conditions & Rewards -->
        <div v-if="selectedNode.encounter?.winConditionA && (selectedNode.revealed || revealAll || selectedNode.status === 'visited' || selectedNode.status === 'current')" class="space-y-2">
          <div class="bg-emerald-900/10 rounded-xl p-3 border border-emerald-900/30">
            <div class="text-xs font-bold text-emerald-400 mb-1">{{ selectedNode.encounter.winConditionA }}</div>
            <div class="text-[10px] text-slate-400">Reward: {{ selectedNode.encounter.rewardA }}</div>
          </div>
          <div v-if="selectedNode.encounter.winConditionB" class="bg-amber-900/10 rounded-xl p-3 border border-amber-900/30">
            <div class="text-xs font-bold text-amber-400 mb-1">{{ selectedNode.encounter.winConditionB }}</div>
            <div class="text-[10px] text-slate-400">Reward: {{ selectedNode.encounter.rewardB }}</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
            <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Exits</div>
            <div class="text-lg font-bold text-amber-400">{{ selectedNode.connections.length }}</div>
          </div>
          <div class="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
            <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Status</div>
            <div class="text-sm font-bold capitalize" :class="{
              'text-emerald-400': selectedNode.status === 'visited',
              'text-amber-400': selectedNode.status === 'available',
              'text-slate-500': selectedNode.status === 'locked'
            }">{{ selectedNode.status }}</div>
          </div>
        </div>

        <div v-if="selectedNode.type === 'monster' || selectedNode.type === 'elite'" class="bg-red-900/10 rounded-xl p-4 border border-red-900/30">
          <div class="text-[10px] text-red-400 uppercase tracking-widest mb-2 font-bold">Threat Assessment</div>
          <div class="flex items-center gap-2">
            <span v-for="i in (selectedNode.type === 'elite' ? 3 : 1)" :key="i">💀</span>
            <span class="text-xs text-red-200/70 font-medium ml-2">
              {{ selectedNode.type === 'elite' ? 'High Danger' : 'Standard Encounter' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
      <div class="text-4xl">🗺️</div>
      <p class="text-sm uppercase tracking-widest px-8">Select a node on the map to view detailed encounter information</p>
    </div>

    <div class="p-4 bg-slate-950/80 border-t border-slate-800">
      <button 
        v-if="selectedNode && selectedNode.status === 'available'"
        @click="emit('enterEncounter', selectedNode)"
        class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95 flex items-center justify-center gap-2"
      >
        <span>Enter Encounter</span>
        <span class="text-xl">➔</span>
      </button>
      <button 
        v-else-if="selectedNode && selectedNode.status === 'current'"
        @click="emit('completeEncounter', selectedNode)"
        class="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-900/20 active:scale-95 flex items-center justify-center gap-2"
      >
        <span>Complete Encounter</span>
        <span class="text-xl">✓</span>
      </button>
      <div v-else class="text-center py-3 text-xs text-slate-600 uppercase tracking-widest font-bold">
        {{ selectedNode ? (selectedNode.status === 'visited' ? 'Already Visited' : 'Path Blocked') : 'Waiting for Input' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style>
