<script setup lang="ts">
import { ref } from 'vue';
import type { DungeonNode, DungeonMapData } from '../types';
import EncounterContent from './EncounterContent.vue';
import EncounterCompletionControls from './EncounterCompletionControls.vue';
import CreateEncounterModal from './CreateEncounterModal.vue';
import type { EncounterData } from '../types';


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

const showCreateModal = ref(false);
const editingEncounter = ref<EncounterData | null>(null);

const editEncounter = () => {
  if (props.selectedNode?.encounter) {
    editingEncounter.value = props.selectedNode.encounter;
    showCreateModal.value = true;
  }
};

const handleEncounterUpdated = (updatedEncounter: EncounterData) => {
  if (props.selectedNode) {
    // Update the local node data to reflect changes immediately
    props.selectedNode.encounter = updatedEncounter;
  }
};



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
        <p class="text-base text-slate-200 leading-relaxed font-serif italic">
          {{ selectedNode.description || 'A mysterious chamber hidden deep within the Undermountain.' }}
        </p>
      </div>

    </div>

    <!-- ============ DM SECTION ============ -->
    <div class="p-6 space-y-4">
      <!-- DM Section Header with Toggle -->
      <!-- DM Section Header with Toggle -->
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <span class="text-red-400 text-lg">🎲</span>
          <h3 class="font-bold text-red-400 text-sm uppercase tracking-wider">DM Info</h3>
        </div>
        <div class="flex items-center gap-2">
          <button 
             v-if="selectedNode.encounter"
             @click="editEncounter"
             class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-700 hover:border-amber-500/50 flex items-center gap-2 transition-colors"
           >
             <span class="text-amber-500">✎</span> Edit
           </button>
          <button
            @click="showDMInfo = !showDMInfo"
            class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
            :class="showDMInfo ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'"
          >
            <span class="mr-1">{{ showDMInfo ? '👁️' : '🔒' }}</span>
            {{ showDMInfo ? 'Hide' : 'Show' }}
          </button>
        </div>
      </div>

      <!-- DM Content (Collapsible) -->
      <div v-show="showDMInfo" class="space-y-4 animate-fadeIn">
        <div class="flex justify-between items-start mb-2">
           <EncounterContent v-if="selectedNode.encounter" :encounter="selectedNode.encounter" class="flex-1" />
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
  <!-- Create/Edit Encounter Modal -->
  <teleport to="body">
    <CreateEncounterModal 
      :show="showCreateModal" 
      :initial-data="editingEncounter"
      @close="showCreateModal = false"
      @created="handleEncounterUpdated"
    />
  </teleport>
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
