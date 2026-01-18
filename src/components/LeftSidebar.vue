<script setup lang="ts">
import { computed } from 'vue';
import { TYPE_COLORS, getNodeIcon } from '../utils/nodeStyles';
import headerDecoration from '../assets/header_decoration.png';

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
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Calculate actual node counts from the generated map
const actualNodeCounts = computed(() => {
  if (!props.mapData?.nodes) {
    return {};
  }
  
  const counts: Record<string, number> = {};
  props.mapData.nodes.forEach((node: any) => {
    if (node.type !== 'boss' && node.type !== 'start') {
      counts[node.type] = (counts[node.type] || 0) + 1;
    }
  });
  
  return counts;
});
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
    
    <div class="p-6 flex-1 overflow-y-auto custom-scrollbar">
      <!-- Legend Section - Shows Actual Generated Counts -->
      <h3 class="font-bold text-slate-100 mb-4 text-sm uppercase tracking-wider border-b border-slate-700/50 pb-2">Legend</h3>
      <div class="space-y-4 mb-6">
        <div v-for="(color, type) in TYPE_COLORS" :key="'legend-' + type">
          <div v-if="type !== 'boss' && type !== 'start'" class="space-y-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center text-2xl shadow-lg border border-white/10" :style="{ backgroundColor: color, color: '#fff' }">
                <span v-if="type !== 'rest'" class="filter drop-shadow-md">{{ getNodeIcon(type as string) }}</span>
                <!-- Small Campfire for Legend -->
                <svg v-else viewBox="-30 -30 60 60" class="w-7 h-7 filter drop-shadow-md">
                  <rect x="-24" y="8" width="48" height="8" rx="2" fill="#5d4037" transform="rotate(-15)" />
                  <rect x="-24" y="8" width="48" height="8" rx="2" fill="#4e342e" transform="rotate(15)" />
                  <rect x="-20" y="4" width="40" height="8" rx="2" fill="#3e2723" />
                  <path d="M -15 4 Q -20 -15 0 -35 Q 20 -15 15 4 Z" fill="#ef4444" />
                  <path d="M -10 4 Q -15 -10 0 -25 Q 15 -10 10 4 Z" fill="#f59e0b" />
                </svg>
              </div>
              <div class="flex-1">
                <div class="capitalize text-xs font-bold text-slate-400 uppercase tracking-tighter">{{ type }}</div>
                <div class="text-sm text-emerald-400 font-semibold mt-1">
                  {{ actualNodeCounts[type] || 0 }} generated
                </div>
              </div>
            </div>
          </div>
          <div v-else class="flex items-center gap-3 opacity-60">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-2xl shadow-lg border border-white/10" :style="{ backgroundColor: color, color: '#fff' }">
              <!-- Custom Well Icon for Start in Legend -->
              <svg v-if="type === 'start'" viewBox="-30 -30 60 60" class="w-7 h-7 filter drop-shadow-md">
                <defs>
                  <radialGradient id="wellGradientLegend" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" style="stop-color:#1e293b;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#020617;stop-opacity:0.9" />
                  </radialGradient>
                </defs>
                <circle cx="0" cy="0" r="28" fill="#6b7280" stroke="#374151" stroke-width="3" />
                <circle cx="0" cy="0" r="20" fill="#0f172a" />
                <circle cx="0" cy="0" r="20" fill="url(#wellGradientLegend)" />
                <path d="M -22 -10 Q 0 -8 22 -10" stroke="#4b5563" stroke-width="2" fill="none" />
                <path d="M -22 0 Q 0 2 22 0" stroke="#4b5563" stroke-width="2" fill="none" />
                <path d="M -22 10 Q 0 12 22 10" stroke="#4b5563" stroke-width="2" fill="none" />
                <line x1="-5" y1="-20" x2="-5" y2="20" stroke="#8b4513" stroke-width="2" opacity="0.7" />
                <line x1="5" y1="-20" x2="5" y2="20" stroke="#8b4513" stroke-width="2" opacity="0.7" />
                <line x1="-5" y1="-10" x2="5" y2="-10" stroke="#8b4513" stroke-width="2" opacity="0.7" />
                <line x1="-5" y1="0" x2="5" y2="0" stroke="#8b4513" stroke-width="2" opacity="0.7" />
                <line x1="-5" y1="10" x2="5" y2="10" stroke="#8b4513" stroke-width="2" opacity="0.7" />
              </svg>
              <span v-else class="filter drop-shadow-md">{{ getNodeIcon(type as string) }}</span>
            </div>
            <span class="capitalize text-sm font-medium text-slate-200">{{ type }}</span>
          </div>
        </div>
      </div>
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
          🔄 Reconfigure Floor
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

    <div class="p-4 bg-slate-950 text-[10px] text-slate-600 border-t border-slate-800 flex justify-between uppercase tracking-widest">
      <span>v0.2.0</span>
      <span>Preview Build</span>
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
