<script setup lang="ts">
interface Props {
  floorCount: number;
  currentFloor: number;
  revealAll: boolean;
  mapData: any;
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
</script>

<template>
  <div class="flex-1 overflow-y-auto custom-scrollbar">
    <div class="p-4 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-slate-100 text-base uppercase tracking-wider">Dungeon Settings</h3>
        <span class="text-[11px] text-slate-500 uppercase tracking-widest">Session</span>
      </div>
      
      <div class="space-y-4">
        <!-- Current Floor Display -->
        <div v-if="mapData" class="bg-slate-900/50 rounded-xl p-4 border border-amber-500/30 shadow-inner">
          <div class="text-[11px] text-slate-400 uppercase tracking-widest mb-2">Current Floor</div>
          <div class="flex items-end justify-between gap-3">
            <div>
              <div class="text-4xl font-bold text-amber-400 leading-none">Floor {{ mapData.currentFloor }}</div>
              <div class="text-sm text-purple-300 mt-1">CR {{ mapData.currentFloor }}</div>
            </div>
            <div class="text-right">
              <div class="text-xs text-slate-400 uppercase tracking-widest">Depth</div>
              <div class="text-xl font-semibold text-slate-200">{{ mapData.layersPerFloor }}</div>
              <div class="text-[11px] text-slate-500">layers</div>
            </div>
          </div>
          <div class="mt-3 border-t border-slate-700/60 pt-3">
            <div class="text-[12px] text-slate-400">Adventure pacing is based on depth and party level.</div>
          </div>
          <div class="mt-3 flex justify-center">
            <button 
              @click="emit('showFloorSummary')"
              class="w-full max-w-[260px] bg-slate-800/60 hover:bg-slate-700 text-purple-300 font-bold py-2.5 px-3 rounded-lg transition-all text-sm border border-slate-600 hover:border-purple-500/50"
            >
              Floor Summary
            </button>
          </div>
        </div>
        
        <!-- Party Configuration Display -->
        <div v-if="mapData" class="bg-slate-900/40 rounded-xl p-4 border border-blue-500/30">
          <div class="text-[11px] text-slate-400 uppercase tracking-widest mb-3">Party Configuration</div>
          <div class="space-y-4 max-w-[360px] mx-auto">
            <!-- Party Size -->
            <div class="bg-slate-900/40 rounded-lg p-3 border border-slate-700/60">
              <div class="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Party Size</div>
              <div class="flex items-center gap-2">
                <button
                  @click="emit('update:partySize', Math.max(1, partySize - 1))"
                  class="w-10 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center font-bold transition-colors"
                  :disabled="partySize <= 1"
                  :class="partySize <= 1 ? 'opacity-50 cursor-not-allowed' : ''"
                >
                  -
                </button>
                <div class="flex-1 text-center">
                  <div class="text-3xl font-bold text-blue-400 leading-none">{{ partySize }}</div>
                  <div class="text-[10px] text-slate-500">characters</div>
                </div>
                <button
                  @click="emit('update:partySize', Math.min(8, partySize + 1))"
                  class="w-10 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center font-bold transition-colors"
                  :disabled="partySize >= 8"
                  :class="partySize >= 8 ? 'opacity-50 cursor-not-allowed' : ''"
                >
                  +
                </button>
              </div>
            </div>
            
            <!-- Average Party Level -->
            <div class="bg-slate-900/40 rounded-lg p-3 border border-slate-700/60">
              <div class="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Average Level</div>
              <div class="flex items-center gap-2">
                <button
                  @click="emit('update:averagePartyLevel', Math.max(1, averagePartyLevel - 1))"
                  class="w-10 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center font-bold transition-colors"
                  :disabled="averagePartyLevel <= 1"
                  :class="averagePartyLevel <= 1 ? 'opacity-50 cursor-not-allowed' : ''"
                >
                  -
                </button>
                <div class="flex-1 text-center">
                  <div class="text-3xl font-bold text-blue-400 leading-none">{{ averagePartyLevel }}</div>
                  <div class="text-[10px] text-slate-500">level</div>
                </div>
                <button
                  @click="emit('update:averagePartyLevel', Math.min(20, averagePartyLevel + 1))"
                  class="w-10 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center font-bold transition-colors"
                  :disabled="averagePartyLevel >= 20"
                  :class="averagePartyLevel >= 20 ? 'opacity-50 cursor-not-allowed' : ''"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div class="mt-3 text-[11px] text-blue-300/70 text-center">
            Changes apply when entering encounters
          </div>
        </div>
        
        <div class="pt-1">
          <div class="grid grid-cols-2 gap-2 w-full max-w-[420px] mx-auto">
            <button 
              @click="emit('regenerate')"
              class="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 px-4 rounded-lg transition-all transform active:scale-95 text-sm shadow-lg shadow-amber-900/20"
            >
              Generate Floor
            </button>
            
            <button 
              @click="emit('update:revealAll', !revealAll)"
              :class="revealAll ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 hover:bg-slate-600'"
              class="w-full text-white font-bold py-2.5 px-4 rounded-lg transition-all text-sm"
            >
              {{ revealAll ? 'Hide All' : 'Reveal All' }}
            </button>
          </div>
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
