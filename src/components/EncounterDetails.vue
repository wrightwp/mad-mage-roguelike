<script setup lang="ts">
import { ref } from 'vue';
import type { DungeonNode, DungeonMapData } from '../types';
import { EncounterType } from '../types';

import CombatEncounter from './encounters/CombatEncounter.vue';
import SocialEncounter from './encounters/SocialEncounter.vue';
import PuzzleEncounter from './encounters/PuzzleEncounter.vue';
import ExplorationEncounter from './encounters/ExplorationEncounter.vue';
import RestEncounter from './encounters/RestEncounter.vue';
import TreasureEncounter from './encounters/TreasureEncounter.vue';
import BossEncounter from './encounters/BossEncounter.vue';
import EncounterCompletionControls from './EncounterCompletionControls.vue';


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
const showDMInfo = ref(true);



// Helper to get connected node
const getConnectedNode = (connectionId: string): DungeonNode | null => {
  if (!props.mapData) return null;
  return props.mapData.nodes.find(n => n.id === connectionId) || null;
};

// Helper to get connected node type
const getConnectedNodeType = (connectionId: string): string => {
  const connectedNode = getConnectedNode(connectionId);
  if (!connectedNode) return 'Unknown Room';
  
  // Format the node type nicely
  if (connectedNode.type === 'start') return 'Dungeon Entrance';
  if (connectedNode.type === 'boss') return 'Boss Chamber';
  return connectedNode.type.charAt(0).toUpperCase() + connectedNode.type.slice(1);
};

// Copy to clipboard functionality
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};


const isReachableFromCurrent = (targetNode: DungeonNode): boolean => {
  if (!props.mapData) return false;
  const currentNode = props.mapData.nodes.find(n => n.status === 'current');
  // If no current node (start of game?), fallback to allowing available
  if (!currentNode) return true;
  return currentNode.connections.includes(targetNode.id);
};
</script>

<template>
  <div v-if="selectedNode" class="flex-1 overflow-y-auto custom-scrollbar">
    <!-- ============ PLAYER SECTION ============ -->
    <div class="p-6 space-y-4 border-b-2 border-emerald-900/30 bg-gradient-to-b from-slate-900/50 to-transparent">

      <!-- Room Description -->
      <div class="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
        <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Room Description</div>
        <p class="text-sm text-slate-200 leading-relaxed font-serif italic">
          {{ selectedNode.description || 'A mysterious chamber hidden deep within the Undermountain.' }}
        </p>
      </div>

      <!-- Exits Info -->
      <div class="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
        <div class="flex items-center gap-3">
          <div class="text-2xl font-bold text-amber-400">{{ selectedNode.connections.length }}</div>
          <div class="text-sm text-slate-400">visible passages leading from this room</div>
        </div>
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
        <div v-if="selectedNode.encounter" 
          class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h2 class="text-lg font-bold text-amber-400 mb-3">{{ selectedNode.encounter.name }}</h2>
          
          <!-- DM Description -->
          <div v-if="selectedNode.encounter.dmDescription" class="mb-3 pb-3 border-b border-slate-700/50">
            <p class="text-sm text-slate-300 leading-relaxed italic">{{ selectedNode.encounter.dmDescription }}</p>
          </div>
          
          <div class="flex gap-2 text-xs flex-wrap">
            <span class="px-2 py-1 bg-slate-700 rounded">Level {{ selectedNode.encounter.level }}</span>
            <span class="px-2 py-1 bg-slate-700 rounded capitalize">{{ selectedNode.encounter.difficulty }}</span>
          </div>
        </div>

        <!-- Dynamic Encounter Details -->
        <div v-if="selectedNode.encounter">
          <CombatEncounter 
            v-if="selectedNode.encounter.type === EncounterType.Combat" 
            :encounter="selectedNode.encounter" 
          />
          <SocialEncounter 
            v-else-if="selectedNode.encounter.type === EncounterType.Social" 
            :encounter="selectedNode.encounter" 
          />
          <PuzzleEncounter 
            v-else-if="selectedNode.encounter.type === EncounterType.Puzzle" 
            :encounter="selectedNode.encounter" 
          />
          <ExplorationEncounter 
            v-else-if="selectedNode.encounter.type === EncounterType.Exploration" 
            :encounter="selectedNode.encounter" 
          />
          <RestEncounter 
            v-else-if="selectedNode.encounter.type === EncounterType.Rest" 
            :encounter="selectedNode.encounter" 
          />
          <TreasureEncounter 
            v-else-if="selectedNode.encounter.type === EncounterType.Treasure" 
            :encounter="selectedNode.encounter" 
          />
          <BossEncounter 
            v-else-if="selectedNode.encounter.type === EncounterType.Boss" 
            :encounter="selectedNode.encounter" 
          />
        </div>


        <!-- Win Conditions & Rewards -->
        <div v-if="selectedNode.encounter?.winConditions?.length" 
          class="bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl p-4 border border-slate-700">
          <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-3 font-bold">
            Win Conditions
          </div>
          <div class="space-y-3">
            <div 
              v-for="(winCondition, index) in selectedNode.encounter.winConditions" 
              :key="index"
              class="rounded-lg p-3 border-l-4 bg-slate-900/40"
              :class="index === 0 ? 'border-emerald-500 bg-emerald-900/5' : 'border-amber-500 bg-amber-900/5'">
              <div class="mb-2">
                <div class="text-sm font-semibold mb-1" :class="index === 0 ? 'text-emerald-300' : 'text-amber-300'">
                  {{ winCondition.condition }}
                </div>
                <div class="text-xs text-slate-400 flex items-center gap-1.5">
                  <span class="font-semibold">Reward:</span>
                  <span class="text-slate-300">{{ winCondition.reward }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>



        <!-- AI Room Prompt -->
        <div v-if="selectedNode.encounter?.aiRoomPrompt" 
          class="bg-purple-900/10 rounded-xl p-4 border border-purple-900/30">
          <div class="text-[10px] text-purple-400 uppercase tracking-widest mb-3 font-bold flex items-center justify-between">
            <span>🤖 AI Room Prompt</span>
            <button
              @click="copyToClipboard(selectedNode.encounter.aiRoomPrompt)"
              class="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded transition-colors">
              📋 Copy
            </button>
          </div>
          <div class="text-xs text-slate-300 bg-slate-900/40 rounded-lg p-3 border border-slate-700/30 font-mono leading-relaxed">
            {{ selectedNode.encounter.aiRoomPrompt }}
          </div>
        </div>

        <!-- Connected Encounters -->
        <div v-if="selectedNode.connections.length > 0" 
          class="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
          <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Paths Lead To:</div>
          <div class="space-y-2">
            <div v-for="connectionId in selectedNode.connections" :key="connectionId" 
              class="flex items-start gap-2 text-xs bg-slate-900/40 rounded-lg p-2.5 border border-slate-700/30 hover:border-amber-500/30 transition-colors">
              <span class="text-amber-400 mt-0.5">→</span>
              <div class="flex-1">
                <div class="capitalize text-slate-300 font-medium mb-0.5">
                  {{ getConnectedNodeType(connectionId) }}
                </div>
                <div v-if="getConnectedNode(connectionId)?.encounter" class="text-[10px] text-slate-400">
                  {{ getConnectedNode(connectionId)?.encounter?.name }}
                </div>
              </div>
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

  <!-- Action Buttons / Completion Controls -->
  <div class="p-4 bg-slate-950/80 border-t border-slate-800">
    
    <!-- Enter Encounter -->
    <button 
      v-if="selectedNode && selectedNode.status === 'available' && isReachableFromCurrent(selectedNode)"
      @click="emit('enterEncounter', selectedNode)"
      class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95 flex items-center justify-center gap-2">
      <span>Enter Encounter</span>
      <span class="text-xl">➔</span>
    </button>

    <!-- Completion Controls (Current or Visited) -->
    <EncounterCompletionControls 
      v-else-if="selectedNode && selectedNode.encounter && (selectedNode.status === 'current' || selectedNode.status === 'visited')"
      :node="selectedNode"
      :encounter="selectedNode.encounter"
      @complete="emit('completeEncounter', selectedNode)"
    />

    <!-- Status Message if unreachable/locked -->
    <div v-else class="text-center py-3 text-xs text-slate-600 uppercase tracking-widest font-bold">
      {{ selectedNode ? (selectedNode.status === 'available' && !isReachableFromCurrent(selectedNode) ? 'Too Far Away' : 'Path Blocked') : 'Waiting for Input' }}
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
