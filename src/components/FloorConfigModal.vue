<script setup lang="ts">
import { ref, computed } from 'vue';
import { TYPE_COLORS, getNodeIcon } from '../utils/nodeStyles';

interface Props {
  show: boolean;
  initialFloor?: number;
  initialFloorDepth?: number;
  initialNodeCounts?: Record<string, number>;
  actualNodeCounts?: Record<string, number>; // Current map's generated counts
}

interface Emits {
  (e: 'generate', config: FloorConfig): void;
  (e: 'cancel'): void;
}

export interface FloorConfig {
  floor: number;
  floorDepth: number;
  nodeCounts: Record<string, number>;
  partySize: number;
  averagePartyLevel: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialFloor: 1,
  initialFloorDepth: 10,
  initialNodeCounts: () => ({
    combat: 30,
    rest: 3,
    treasure: 4,
    puzzle: 6,
    social: 3,
    exploration: 4
  })
});

const emit = defineEmits<Emits>();

// Local state for configuration
const selectedFloor = ref(props.initialFloor);
const floorDepth = ref(props.initialFloorDepth);
const nodeCounts = ref({ ...props.initialNodeCounts });
const partySize = ref(4);
const averagePartyLevel = ref(1);

// Computed values
const totalNodes = computed(() => {
  return Object.values(nodeCounts.value).reduce((sum, count) => sum + count, 0);
});

const estimatedLayers = computed(() => {
  return floorDepth.value;
});

// Update node count
const updateNodeCount = (type: string, value: number) => {
  nodeCounts.value[type] = Math.max(0, Math.min(50, value));
};

// Reset to defaults
const resetToDefaults = () => {
  selectedFloor.value = 1;
  floorDepth.value = 10;
  nodeCounts.value = {
    combat: 30,
    rest: 3,
    treasure: 4,
    puzzle: 6,
    social: 3,
    exploration: 4
  };
  partySize.value = 4;
  averagePartyLevel.value = 1;
};

// Generate floor
const handleGenerate = () => {
  emit('generate', {
    floor: selectedFloor.value,
    floorDepth: floorDepth.value,
    nodeCounts: { ...nodeCounts.value },
    partySize: partySize.value,
    averagePartyLevel: averagePartyLevel.value
  });
};

// Handle cancel
const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <div 
    v-if="show" 
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    @click.self="handleCancel"
  >
    <div class="bg-slate-900 border-2 border-amber-600/50 rounded-2xl p-8 max-w-2xl w-full shadow-2xl transform transition-all scale-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
          🏰
        </div>
        <h2 class="text-3xl font-bold text-amber-400 tracking-wider fantasy-header mystical-glow">
          Configure Floor Generation
        </h2>
        <p class="text-slate-400 text-sm mt-2">
          Customize your descent into Undermountain
        </p>
      </div>

      <!-- Configuration Sections -->
      <div class="space-y-6">

        <!-- Floor Selection -->
        <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 class="text-lg font-bold text-slate-100 mb-4 uppercase tracking-wider flex items-center gap-2">
            <span>📍</span> Floor Selection
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-slate-400 mb-2 tracking-widest uppercase">Floor Number</label>
              <input 
                type="number" 
                v-model.number="selectedFloor"
                min="1" 
                max="21"
                class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 text-lg font-bold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-2 tracking-widest uppercase">Challenge Rating</label>
              <div class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-amber-400 text-lg font-bold">
                CR {{ selectedFloor }}
              </div>
            </div>
          </div>
        </div>

        <!-- Floor Depth -->
        <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 class="text-lg font-bold text-slate-100 mb-4 uppercase tracking-wider flex items-center gap-2">
            <span>📏</span> Floor Depth
          </h3>
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="text-xs text-slate-400 tracking-widest uppercase">Number of Layers</label>
              <span class="text-2xl font-bold text-amber-400">{{ floorDepth }}</span>
            </div>
            <input 
              type="range" 
              v-model.number="floorDepth"
              min="5" 
              max="30"
              class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div class="flex justify-between text-xs text-slate-500 mt-1">
              <span>5 (Short)</span>
              <span>30 (Epic)</span>
            </div>
            <div class="text-[10px] text-slate-500 text-center mt-2 italic">
              Count includes boss level but excludes the entry room (+1).
            </div>
          </div>
        </div>

        <!-- Party Configuration -->
        <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 class="text-lg font-bold text-slate-100 mb-4 uppercase tracking-wider flex items-center gap-2">
            <span>👥</span> Party Configuration
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-slate-400 mb-2 tracking-widest uppercase">Party Size</label>
              <input 
                type="number" 
                v-model.number="partySize"
                min="1" 
                max="8"
                class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 text-lg font-bold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
              <div class="text-[10px] text-slate-500 mt-1">Number of player characters (1-8)</div>
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-2 tracking-widest uppercase">Average Party Level</label>
              <input 
                type="number" 
                v-model.number="averagePartyLevel"
                min="1" 
                max="20"
                class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 text-lg font-bold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
              <div class="text-[10px] text-slate-500 mt-1">Average level of the party (1-20)</div>
            </div>
          </div>
          <div class="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <div class="text-xs text-blue-300 flex items-start gap-2">
              <span class="text-base">ℹ️</span>
              <div>
                <div class="font-bold mb-1">Dynamic Scaling</div>
                <div class="text-blue-200/80">Combat encounters will scale based on party size (monster count) and party level (difficulty tier). Scaling applies during generation and when entering encounters.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Encounter Distribution -->
        <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span>⚔️</span> Encounter Distribution
            </h3>
            <div class="text-[10px] text-amber-500/80 uppercase tracking-widest bg-amber-900/20 px-2 py-1 rounded border border-amber-600/20">
              Values represent maximums
            </div>
          </div>
          
          <p class="text-[11px] text-slate-400 mb-4 italic">
            Non-combat encounters are weighted to appear more frequently, up to their specified maximum count.
          </p>

          <div class="grid grid-cols-2 gap-4">
            <div v-for="(color, type) in TYPE_COLORS" :key="type">
              <div v-if="type !== 'boss' && type !== 'start'" class="flex items-center gap-3 bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                <div class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-lg border border-white/10 flex-shrink-0" :style="{ backgroundColor: color, color: '#fff' }">
                  <span v-if="type !== 'rest'" class="filter drop-shadow-md">{{ getNodeIcon(type as string) }}</span>
                  <!-- Small Campfire -->
                  <svg v-else viewBox="-30 -30 60 60" class="w-7 h-7 filter drop-shadow-md">
                    <rect x="-24" y="8" width="48" height="8" rx="2" fill="#5d4037" transform="rotate(-15)" />
                    <rect x="-24" y="8" width="48" height="8" rx="2" fill="#4e342e" transform="rotate(15)" />
                    <rect x="-20" y="4" width="40" height="8" rx="2" fill="#3e2723" />
                    <path d="M -15 4 Q -20 -15 0 -35 Q 20 -15 15 4 Z" fill="#ef4444" />
                    <path d="M -10 4 Q -15 -10 0 -25 Q 15 -10 10 4 Z" fill="#f59e0b" />
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="capitalize text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">{{ type }}</div>
                  <div class="flex items-center gap-2">
                    <input 
                      type="number" 
                      :value="nodeCounts[type]"
                      @input="updateNodeCount(type, Number(($event.target as HTMLInputElement).value))"
                      min="0" 
                      max="50"
                      class="w-16 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-200 font-semibold focus:outline-none focus:border-amber-500 text-sm"
                    />
                    <span v-if="actualNodeCounts && actualNodeCounts[type] !== undefined" 
                      class="text-xs text-emerald-400 font-bold bg-emerald-900/30 px-2 py-1 rounded border border-emerald-600/30">
                      {{ actualNodeCounts[type] }} generated
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="bg-gradient-to-br from-amber-900/20 to-purple-900/20 rounded-xl p-6 border-2 border-amber-600/30">
          <h3 class="text-lg font-bold text-amber-400 mb-4 uppercase tracking-wider flex items-center gap-2">
            <span>📊</span> Generation Summary
          </h3>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <div class="text-xs text-slate-400 uppercase tracking-widest mb-1">Total Nodes</div>
              <div class="text-3xl font-bold text-emerald-400">~{{ totalNodes }}</div>
            </div>
            <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <div class="text-xs text-slate-400 uppercase tracking-widest mb-1">Layers</div>
              <div class="text-3xl font-bold text-blue-400">{{ estimatedLayers }}</div>
            </div>
            <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <div class="text-xs text-slate-400 uppercase tracking-widest mb-1">Difficulty</div>
              <div class="text-3xl font-bold text-red-400">CR {{ selectedFloor }}</div>
            </div>
          </div>
          <div class="mt-4 text-xs text-slate-400 text-center">
            <span class="text-amber-400">⚠️</span> Actual node count may vary based on layer generation
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-4 mt-8">
        <button 
          @click="resetToDefaults"
          class="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-6 rounded-xl transition-all border border-slate-700 transform active:scale-95"
        >
          🔄 Reset Defaults
        </button>
        <button 
          @click="handleGenerate"
          class="flex-[2] bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-amber-900/40 transform active:scale-95"
        >
          ⚔️ Generate Floor
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

.fantasy-header {
  font-family: 'Cinzel', serif;
}

.mystical-glow {
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
}

/* Custom range slider styling */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f59e0b;
  cursor: pointer;
  border: 3px solid #1e293b;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f59e0b;
  cursor: pointer;
  border: 3px solid #1e293b;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
}
</style>
