<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../stores/useGameStore';

defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const gameStore = useGameStore();

const floorData = computed(() => gameStore.currentFloor);
const metrics = computed(() => floorData.value?.metrics);

const completedEncounters = computed(() => {
  if (!floorData.value) return [];
  
  // Filter visited nodes that have results
  // We want to show them in order of visit?
  // visitedNodes is ordered array of IDs.
  
  const results = floorData.value.encounterResults || {};
  
  return floorData.value.visitedNodes
    .map(id => {
      const node = floorData.value?.layout.find(n => n.id === id);
      const result = results[id];
      if (!node || !result) return null;
      
      const totalXP = (result.xp || 0) + (result.customXP || 0);
      const totalGold = (result.gold || 0) + (result.customGold || 0);
      
      return {
        id,
        name: node.encounter?.name || node.type,
        type: node.type,
        totalXP,
        totalGold,
        conditions: result.conditions
      };
    })
    .filter(item => item !== null)
    .reverse(); // Newest first
});

const progressPercent = computed(() => {
  if (!floorData.value) return 0;
  
  // Calculate based on layers completed, not nodes
  // Find the highest layer among visited nodes
  const visitedLayers = floorData.value.visitedNodes
    .map(id => floorData.value?.layout.find(n => n.id === id)?.layer ?? 0);
  const highestLayer = Math.max(0, ...visitedLayers);
  
  // Get the total number of layers (max layer value in layout)
  const totalLayers = Math.max(...floorData.value.layout.map(n => n.layer));
  
  if (totalLayers === 0) return 0;
  return Math.round((highestLayer / totalLayers) * 100);
});
</script>

<template>
  <div 
    v-if="show" 
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="bg-slate-900 border-2 border-emerald-600/50 rounded-2xl p-0 max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
      
      <!-- Header -->
      <div class="p-6 pb-4 bg-slate-950 border-b border-emerald-900/50">
        <div class="flex justify-between items-start mb-2">
          <div>
            <h2 class="text-2xl font-bold text-emerald-400 tracking-wider">Floor Summary</h2>
            <div class="text-xs text-slate-500 uppercase tracking-widest mt-1">Floor {{ gameStore.currentFloor?.floorNumber }} Progress</div>
          </div>
          <button 
            @click="emit('close')"
            class="text-slate-500 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        <!-- Big Metrics -->
        <div class="grid grid-cols-2 gap-4 mt-4">
          <div class="bg-purple-900/20 border border-purple-500/30 rounded-xl p-3 text-center">
            <div class="text-[10px] text-purple-400 uppercase tracking-widest mb-1">Total XP</div>
            <div class="text-3xl font-bold text-purple-200 font-mono">{{ metrics?.xpEarned || 0 }}</div>
          </div>
          <div class="bg-amber-900/20 border border-amber-500/30 rounded-xl p-3 text-center">
            <div class="text-[10px] text-amber-400 uppercase tracking-widest mb-1">Total Gold</div>
            <div class="text-3xl font-bold text-amber-200 font-mono">{{ metrics?.goldEarned || 0 }}</div>
          </div>
        </div>
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
        <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Completed Encounters</span>
          <span class="text-xs text-slate-500 font-normal">{{ completedEncounters.length }} total</span>
        </h3>
        
        <div v-if="completedEncounters.length === 0" class="text-center py-8 text-slate-600 text-sm italic border-2 border-dashed border-slate-800 rounded-xl">
          No encounters completed yet.
        </div>

        <div v-for="item in completedEncounters" :key="item?.id" 
          class="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex flex-col gap-2">
          
          <div class="flex justify-between items-start">
            <div>
              <div class="font-bold text-slate-200 text-sm">{{ item?.name }}</div>
              <div class="text-[10px] text-slate-500 uppercase tracking-wider">{{ item?.type }}</div>
            </div>
            <div class="text-right">
              <div class="text-purple-300 text-xs font-mono font-bold">+{{ item?.totalXP }} XP</div>
              <div class="text-amber-300 text-xs font-mono font-bold">+{{ item?.totalGold }} GP</div>
            </div>
          </div>

          <div v-if="item?.conditions && item.conditions.length > 0" class="flex flex-wrap gap-1 mt-1">
            <span v-for="cond in item.conditions" :key="cond" 
              class="px-1.5 py-0.5 bg-slate-900 rounded text-[10px] text-slate-400 border border-slate-700">
              {{ cond }}
            </span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 bg-slate-950 border-t border-slate-800 text-center">
        <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
          <div class="bg-emerald-500 h-full transition-all duration-1000" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="text-xs text-slate-500">
          {{ progressPercent }}% Floor Clearance
        </div>
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
