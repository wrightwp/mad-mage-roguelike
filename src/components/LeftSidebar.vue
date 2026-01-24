<script setup lang="ts">
import { ref } from 'vue';
import headerDecoration from '../assets/header_decoration.png';
import SaveManagerModal from './SaveManagerModal.vue';

interface Props {
  width: number;
  floorCount: number;
  currentFloor: number;
  revealAll: boolean;
  mapData: any; // DungeonMapData
  partySize: number;
  averagePartyLevel: number;
}

interface Emits {
  (e: 'update:floorCount', value: number): void;
  (e: 'update:currentFloor', value: number): void;
  (e: 'update:revealAll', value: boolean): void;
  (e: 'update:partySize', value: number): void;
  (e: 'update:averagePartyLevel', value: number): void;
  (e: 'regenerate'): void;
  (e: 'showFloorSummary'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const showSaveManager = ref(false);
</script>

<template>
  <div 
    class="flex-shrink-0 flex flex-col border-r border-slate-800 bg-slate-900/90 text-slate-300 shadow-2xl z-20 backdrop-blur-md relative transform-gpu overflow-hidden"
    :style="{ width: width + 'px' }"
  >
    <div class="p-6 border-b border-slate-700 bg-slate-900 relative overflow-hidden" :style="{ backgroundImage: `url(${headerDecoration})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
      <div class="absolute inset-0 bg-slate-900/80"></div>
      <h1 class="text-2xl font-bold text-amber-400 tracking-wider fantasy-header mystical-glow relative z-10">DUNGEON MAP</h1>
      <div class="text-xs text-purple-300 mt-1 uppercase tracking-widest relative z-10" style="font-family: 'Cinzel', serif;">Undermountain - Halaster's Domain</div>
    </div>
    
    <div class="flex-1 overflow-y-auto custom-scrollbar">
      <!-- Content area - Legend moved to Reconfigure Floor modal -->
    </div>

    <!-- Map Settings -->
    <div class="p-4 border-t border-slate-700 bg-slate-900/50">
      <h3 class="font-bold text-slate-100 mb-3 text-sm uppercase tracking-wider">Dungeon Settings</h3>
      
      <div class="space-y-3">
        <!-- Current Floor Display -->
        <div v-if="mapData" class="bg-slate-800/50 rounded p-3 border border-amber-500/30">
          <div class="text-xs text-slate-400 uppercase tracking-widest mb-1">Current Floor</div>
          <div class="text-2xl font-bold text-amber-400">
            Floor {{ mapData.currentFloor }}
          </div>
          <div class="text-xs text-purple-300 mt-1">CR {{ mapData.currentFloor }}</div>
          <div class="text-xs text-slate-400 mt-2">
            {{ mapData.layersPerFloor }} layers deep
          </div>
          <button 
            @click="emit('showFloorSummary')"
            class="w-full mt-3 bg-slate-700/50 hover:bg-slate-700 text-purple-300 font-bold py-2 px-3 rounded transition-all text-xs border border-slate-600 hover:border-purple-500/50"
          >
            📋 Floor Summary
          </button>
        </div>
        
        <!-- Party Configuration Display -->
        <div v-if="mapData" class="bg-slate-800/50 rounded p-3 border border-blue-500/30">
          <div class="text-xs text-slate-400 uppercase tracking-widest mb-3">👥 Party Configuration</div>
          <div class="space-y-3">
            <!-- Party Size -->
            <div>
              <div class="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Party Size</div>
              <div class="flex items-center gap-2">
                <button
                  @click="emit('update:partySize', Math.max(1, partySize - 1))"
                  class="w-8 h-8 bg-slate-700 hover:bg-slate-600 text-white rounded flex items-center justify-center font-bold transition-colors"
                  :disabled="partySize <= 1"
                  :class="partySize <= 1 ? 'opacity-50 cursor-not-allowed' : ''"
                >
                  −
                </button>
                <div class="flex-1 text-center">
                  <div class="text-2xl font-bold text-blue-400">{{ partySize }}</div>
                  <div class="text-[9px] text-slate-500">characters</div>
                </div>
                <button
                  @click="emit('update:partySize', Math.min(8, partySize + 1))"
                  class="w-8 h-8 bg-slate-700 hover:bg-slate-600 text-white rounded flex items-center justify-center font-bold transition-colors"
                  :disabled="partySize >= 8"
                  :class="partySize >= 8 ? 'opacity-50 cursor-not-allowed' : ''"
                >
                  +
                </button>
              </div>
            </div>
            
            <!-- Average Party Level -->
            <div>
              <div class="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Average Level</div>
              <div class="flex items-center gap-2">
                <button
                  @click="emit('update:averagePartyLevel', Math.max(1, averagePartyLevel - 1))"
                  class="w-8 h-8 bg-slate-700 hover:bg-slate-600 text-white rounded flex items-center justify-center font-bold transition-colors"
                  :disabled="averagePartyLevel <= 1"
                  :class="averagePartyLevel <= 1 ? 'opacity-50 cursor-not-allowed' : ''"
                >
                  −
                </button>
                <div class="flex-1 text-center">
                  <div class="text-2xl font-bold text-blue-400">{{ averagePartyLevel }}</div>
                  <div class="text-[9px] text-slate-500">level</div>
                </div>
                <button
                  @click="emit('update:averagePartyLevel', Math.min(20, averagePartyLevel + 1))"
                  class="w-8 h-8 bg-slate-700 hover:bg-slate-600 text-white rounded flex items-center justify-center font-bold transition-colors"
                  :disabled="averagePartyLevel >= 20"
                  :class="averagePartyLevel >= 20 ? 'opacity-50 cursor-not-allowed' : ''"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div class="mt-3 text-[9px] text-blue-300/60 italic text-center">
            Changes apply when entering encounters
          </div>
        </div>
        
        <button 
          @click="emit('regenerate')"
          class="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 px-4 rounded transition-all transform active:scale-95 text-sm shadow-lg shadow-amber-900/20"
        >
          🔄 Generate Floor
        </button>
        
        <button 
          @click="emit('update:revealAll', !revealAll)"
          :class="revealAll ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 hover:bg-slate-600'"
          class="w-full text-white font-bold py-2.5 px-4 rounded transition-all text-sm"
        >
          {{ revealAll ? '👁️ Hide All' : '👁️ Reveal All' }}
        </button>


      </div>
    </div>

    <div class="p-4 bg-slate-950 text-[10px] text-slate-600 border-t border-slate-800 flex justify-between uppercase tracking-widest items-center">
      <span>v0.2.0</span>
      <button @click="showSaveManager = true" class="hover:text-amber-500 transition-colors flex items-center gap-1">
        <span>💾</span> Manage Saves
      </button>
    </div>

    <SaveManagerModal :show="showSaveManager" @close="showSaveManager = false" />
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
