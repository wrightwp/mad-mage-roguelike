<script setup lang="ts">
import { ref, watch } from 'vue';
import type { DungeonNode, DungeonMapData } from '../types';
import { EncounterType } from '../types';
import { getNodeColor, getNodeIcon } from '../utils/nodeStyles';

interface Props {
  selectedNode: DungeonNode | null;
  revealAll: boolean;
  mapData: DungeonMapData | null;
}

interface Emits {
  (e: 'enterEncounter', node: DungeonNode): void;
  (e: 'completeEncounter', node: DungeonNode): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// DM info toggle state
const showDMInfo = ref(false);

// Reset DM info visibility when selecting a new encounter
watch(() => props.selectedNode, () => {
  showDMInfo.value = false;
});

// Helper to get connected node type
const getConnectedNodeType = (connectionId: string): string => {
  if (!props.mapData) return 'Unknown Room';
  
  const connectedNode = props.mapData.nodes.find(n => n.id === connectionId);
  if (!connectedNode) return 'Unknown Room';
  
  // Format the node type nicely
  if (connectedNode.type === 'start') return 'Dungeon Entrance';
  if (connectedNode.type === 'boss') return 'Boss Chamber';
  return connectedNode.type.charAt(0).toUpperCase() + connectedNode.type.slice(1);
};
</script>

<template>
  <div v-if="selectedNode" class="flex-1 overflow-y-auto custom-scrollbar">
    <!-- ============ PLAYER SECTION ============ -->
    <div class="p-6 space-y-4 border-b-2 border-emerald-900/30 bg-gradient-to-b from-slate-900/50 to-transparent">

      <!-- Icon Display -->
      <div class="flex justify-center py-2">
        <div class="w-20 h-20 rounded-xl flex items-center justify-center text-4xl shadow-xl border-2 border-white/10 relative overflow-hidden" 
          :style="{ backgroundColor: (selectedNode.revealed || revealAll || selectedNode.status === 'visited' || selectedNode.status === 'current') ? getNodeColor(selectedNode.type) : '#1e293b' }">
          <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
          <template v-if="selectedNode.revealed || revealAll || selectedNode.status === 'visited' || selectedNode.status === 'current'">
            <span v-if="selectedNode.type !== 'rest'" class="relative z-10 filter drop-shadow-lg">{{ getNodeIcon(selectedNode.type) }}</span>
            <!-- Campfire SVG for rest nodes -->
            <svg v-else viewBox="-30 -40 60 60" class="w-16 h-16 relative z-10 drop-shadow-xl">
              <rect x="-24" y="8" width="48" height="8" rx="2" fill="#5d4037" transform="rotate(-15)" />
              <rect x="-24" y="8" width="48" height="8" rx="2" fill="#4e342e" transform="rotate(15)" />
              <rect x="-20" y="4" width="40" height="8" rx="2" fill="#3e2723" />
              <path d="M -15 4 Q -20 -15 0 -35 Q 20 -15 15 4 Z" fill="#ef4444" />
              <path d="M -10 4 Q -15 -10 0 -25 Q 15 -10 10 4 Z" fill="#f59e0b" />
            </svg>
          </template>
          <span v-else class="text-slate-600 text-5xl">?</span>
        </div>
      </div>

      <!-- Room Description -->
      <div class="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
        <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Room Description</div>
        <p class="text-sm text-slate-200 leading-relaxed font-serif italic">
          {{ (selectedNode.revealed || revealAll || selectedNode.status === 'visited' || selectedNode.status === 'current') ? (selectedNode.description || 'A mysterious chamber hidden deep within the Undermountain.') : 'The mysteries of this chamber are yet to be revealed...' }}
        </p>
      </div>

    </div>

    <!-- ============ DM SECTION ============ -->
    <div class="p-6 space-y-4">
      <!-- DM Section Header with Toggle -->
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <span class="text-red-400 text-lg">🎲</span>
          <h3 class="font-bold text-red-400 text-sm uppercase tracking-wider">DM Info</h3>
        </div>
        <button
          @click="showDMInfo = !showDMInfo"
          class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
          :class="showDMInfo ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'"
        >
          <span class="mr-1">{{ showDMInfo ? '👁️' : '🔒' }}</span>
          {{ showDMInfo ? 'Hide' : 'Show' }}
        </button>
      </div>

      <!-- DM Content (Collapsible) -->
      <div v-show="showDMInfo" class="space-y-4 animate-fadeIn">
        <!-- Encounter Header -->
        <div v-if="selectedNode.encounter && (selectedNode.revealed || revealAll || selectedNode.status === 'visited' || selectedNode.status === 'current')" 
          class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h2 class="text-lg font-bold text-amber-400">{{ selectedNode.encounter.name }}</h2>
          <div class="flex gap-2 mt-2 text-xs flex-wrap">
            <span class="px-2 py-1 bg-slate-700 rounded">Level {{ selectedNode.encounter.level }}</span>
            <span class="px-2 py-1 bg-slate-700 rounded capitalize">{{ selectedNode.encounter.type }}</span>
            <span class="px-2 py-1 bg-slate-700 rounded capitalize">{{ selectedNode.encounter.difficulty }}</span>
          </div>
        </div>

        <!-- Combat Details -->
        <div v-if="selectedNode.encounter && selectedNode.encounter.type === EncounterType.Combat && (selectedNode.revealed || revealAll || selectedNode.status === 'visited' || selectedNode.status === 'current')" 
          class="bg-red-900/10 rounded-xl p-4 border border-red-900/30">
          <div class="text-[10px] text-red-400 uppercase tracking-widest mb-2 font-bold">Combat Encounter</div>
          <div v-if="selectedNode.encounter.monsters?.length" class="text-sm text-slate-300 mb-2">
            <strong class="text-red-300">Enemies:</strong> {{ selectedNode.encounter.monsters.map(m => m.name).join(', ') }}
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
        <div v-if="selectedNode.encounter?.winConditions?.length && (selectedNode.revealed || revealAll || selectedNode.status === 'visited' || selectedNode.status === 'current')" 
          class="space-y-2">
          <div 
            v-for="(winCondition, index) in selectedNode.encounter.winConditions" 
            :key="index"
            class="rounded-xl p-3 border"
            :class="index === 0 ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-amber-900/10 border-amber-900/30'">
            <div class="text-xs font-bold mb-1" :class="index === 0 ? 'text-emerald-400' : 'text-amber-400'">{{ winCondition.condition }}</div>
            <div class="text-[10px] text-slate-400">Reward: {{ winCondition.reward }}</div>
          </div>
        </div>

        <!-- Threat Assessment -->
        <div v-if="selectedNode.type === 'monster' || selectedNode.type === 'elite'" 
          class="bg-red-900/10 rounded-xl p-4 border border-red-900/30">
          <div class="text-[10px] text-red-400 uppercase tracking-widest mb-2 font-bold">Threat Assessment</div>
          <div class="flex items-center gap-2">
            <span v-for="i in (selectedNode.type === 'elite' ? 3 : 1)" :key="i">💀</span>
            <span class="text-xs text-red-200/70 font-medium ml-2">
              {{ selectedNode.type === 'elite' ? 'High Danger' : 'Standard Encounter' }}
            </span>
          </div>
        </div>

        <!-- Exits with Room Types -->
        <div class="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
          <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Visible Exits</div>
          <div class="text-2xl font-bold text-amber-400 mb-2">{{ selectedNode.connections.length }}</div>
          <div class="text-xs text-slate-400 mb-3">
            {{ selectedNode.connections.length === 1 ? 'passage' : 'passages' }} leading from this chamber
          </div>
          
          <!-- List of connected room types (if revealed) -->
          <div v-if="(selectedNode.revealed || revealAll || selectedNode.status === 'visited' || selectedNode.status === 'current') && selectedNode.connections.length > 0" 
            class="space-y-1.5 mt-3 pt-3 border-t border-slate-700/50">
            <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Paths Lead To:</div>
            <div v-for="connectionId in selectedNode.connections" :key="connectionId" 
              class="flex items-center gap-2 text-xs">
              <span class="text-amber-400">→</span>
              <span class="capitalize text-slate-300">
                {{ getConnectedNodeType(connectionId) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Collapsed State Message -->
      <div v-show="!showDMInfo" class="text-center py-8 text-slate-500 text-sm italic">
        DM information hidden - click "Show" to reveal encounter details
      </div>
    </div>
  </div>

  <!-- No Selection State -->
  <div v-else class="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
    <div class="text-4xl">🗺️</div>
    <p class="text-sm uppercase tracking-widest px-8">Select a node on the map to view detailed encounter information</p>
  </div>

  <!-- Action Buttons -->
  <div class="p-4 bg-slate-950/80 border-t border-slate-800">
    <button 
      v-if="selectedNode && selectedNode.status === 'available'"
      @click="emit('enterEncounter', selectedNode)"
      class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95 flex items-center justify-center gap-2">
      <span>Enter Encounter</span>
      <span class="text-xl">➔</span>
    </button>
    <button 
      v-else-if="selectedNode && selectedNode.status === 'current'"
      @click="emit('completeEncounter', selectedNode)"
      class="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-900/20 active:scale-95 flex items-center justify-center gap-2">
      <span>Complete Encounter</span>
      <span class="text-xl">✓</span>
    </button>
    <div v-else class="text-center py-3 text-xs text-slate-600 uppercase tracking-widest font-bold">
      {{ selectedNode ? (selectedNode.status === 'visited' ? 'Already Visited' : 'Path Blocked') : 'Waiting for Input' }}
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

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>
