<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { DungeonNode } from '../types';
import type { EncounterData } from '../types/EncounterData';
import { useGameStore } from '../stores/useGameStore';

const props = defineProps<{
  node: DungeonNode;
  encounter: EncounterData;
}>();

const emit = defineEmits<{
  (e: 'complete'): void;
}>();

const gameStore = useGameStore();

// Local State
const selectedConditions = ref<string[]>([]);
const customXP = ref<number>(0);
const customGold = ref<number>(0);
const isExpanded = ref(false); // Start collapsed by default

// Load saved results if available
const loadSavedResults = () => {
  const saved = gameStore.currentFloor?.encounterResults?.[props.node.id];
  if (saved) {
    selectedConditions.value = [...saved.conditions];
    customXP.value = saved.customXP || 0;
    customGold.value = saved.customGold || 0;
  } else {
    // Determine defaults or clear logic?
    // If simply revisiting a "visited" node without data, we default to empty.
    selectedConditions.value = [];
    customXP.value = 0;
    customGold.value = 0;
  }
};

watch(() => props.node.id, loadSavedResults, { immediate: true });

// Calculated Totals
const totalXP = computed(() => {
  let xp = customXP.value || 0;
  if (props.encounter.winConditions) {
    props.encounter.winConditions.forEach(cond => {
      if (selectedConditions.value.includes(cond.condition)) {
        let val = cond.xpReward;
        if (val === undefined || val === null) {
             // Try parse regex for "123 XP"
             const match = cond.reward.match(/(\d+)\s*XP/i);
             if (match) val = parseInt(match[1]);
        }
        xp += (val || 0);
      }
    });
  }
  return xp;
});

const totalGold = computed(() => {
  let gold = customGold.value || 0;
  if (props.encounter.winConditions) {
    props.encounter.winConditions.forEach(cond => {
      if (selectedConditions.value.includes(cond.condition)) {
        let val = cond.goldReward;
        if (val === undefined || val === null) {
             // Try parse regex for "123 gp" or "123 gold" or "123 GP"
             const match = cond.reward.match(/(\d+)\s*(?:gp|gold|GP)/i);
             if (match) val = parseInt(match[1]);
        }
        gold += (val || 0);
      }
    });
  }
  return gold;
});

// Actions
const handleSave = () => {
  // Calculate the base XP/Gold from conditions (excluding custom bonuses)
  const conditionXP = totalXP.value - (customXP.value || 0);
  const conditionGold = totalGold.value - (customGold.value || 0);
  
  const result = {
    xp: conditionXP,
    gold: conditionGold,
    conditions: [...selectedConditions.value],
    customXP: customXP.value,
    customGold: customGold.value
  };

  // Safe check for store action existence (in case of HMR lag)
  if (gameStore.updateEncounterResult) {
    gameStore.updateEncounterResult(props.node.id, result);
  } else {
    console.error("Store action updateEncounterResult missing");
  }

  // If node is current, emit complete to trigger movement/status update
  if (props.node.status === 'current') {
    emit('complete');
  }
};

const toggleCondition = (condition: string) => {
  const idx = selectedConditions.value.indexOf(condition);
  if (idx === -1) {
    selectedConditions.value.push(condition);
  } else {
    selectedConditions.value.splice(idx, 1);
  }
};
</script>

<template>
  <div class="bg-slate-900/80 rounded-xl border border-slate-700 overflow-hidden">
    <!-- Header -->
    <div 
      @click="isExpanded = !isExpanded"
      class="p-4 flex items-center justify-between cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-colors"
    >
      <div class="flex items-center gap-2">
        <span class="text-xl">🏆</span>
        <h3 class="font-bold text-amber-400 uppercase tracking-widest text-sm">
          Encounter Results
        </h3>
      </div>
      <div class="flex items-center gap-4">
        <div v-if="!isExpanded && (totalXP > 0 || totalGold > 0)" class="text-xs text-slate-400 flex gap-3">
          <span v-if="totalXP > 0" class="text-purple-300 font-bold">+{{ totalXP }} XP</span>
          <span v-if="totalGold > 0" class="text-amber-300 font-bold">+{{ totalGold }} GP</span>
        </div>
        <span class="text-slate-500 transform transition-transform" :class="isExpanded ? 'rotate-180' : ''">▼</span>
      </div>
    </div>

    <!-- Content -->
    <div v-if="isExpanded" class="p-4 pt-0 space-y-4 border-t border-slate-700/50 animate-slideDown">
      
      <!-- Win Conditions -->
      <div v-if="encounter.winConditions && encounter.winConditions.length > 0" class="mt-4">
        <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Outcomes</div>
        <div class="space-y-2">
          <div 
            v-for="(cond, idx) in encounter.winConditions" 
            :key="idx"
            @click="toggleCondition(cond.condition)"
            class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-slate-800"
            :class="selectedConditions.includes(cond.condition) 
              ? 'bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
              : 'bg-slate-950/30 border-slate-800'"
          >
            <div 
              class="w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
              :class="selectedConditions.includes(cond.condition)
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-slate-600 bg-slate-900'"
            >
              <span v-if="selectedConditions.includes(cond.condition)" class="text-xs font-bold">✓</span>
            </div>
            <div class="flex-1">
              <div class="text-sm text-slate-200 font-medium leading-tight mb-1">{{ cond.condition }}</div>
              <div class="text-xs text-slate-500 flex flex-wrap gap-2">
                <span v-if="cond.xpReward" class="text-purple-400 font-bold">+{{ cond.xpReward }} XP</span>
                <span v-if="cond.goldReward" class="text-amber-400 font-bold">+{{ cond.goldReward }} GP</span>
                <span v-if="cond.reward" class="italic">{{ cond.reward }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- DM Custom Entry -->
      <div class="grid grid-cols-2 gap-4 pt-2">
        <div class="space-y-1">
          <label class="text-[10px] text-purple-400 uppercase tracking-widest font-bold">Bonus XP</label>
          <div class="relative">
            <input 
              type="number" 
              v-model.number="customXP"
              min="0"
              step="10"
              class="w-full bg-slate-950 border border-purple-500/30 rounded-lg py-2 pl-3 pr-8 text-purple-200 font-mono font-bold focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
            />
            <span class="absolute right-3 top-2 text-xs text-purple-500/50 font-bold">XP</span>
          </div>
        </div>
        <div class="space-y-1">
          <label class="text-[10px] text-amber-400 uppercase tracking-widest font-bold">Bonus Gold</label>
          <div class="relative">
            <input 
              type="number" 
              v-model.number="customGold"
              min="0"
              step="10"
              class="w-full bg-slate-950 border border-amber-500/30 rounded-lg py-2 pl-3 pr-8 text-amber-200 font-mono font-bold focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
            />
            <span class="absolute right-3 top-2 text-xs text-amber-500/50 font-bold">GP</span>
          </div>
        </div>
      </div>

      <!-- Summary & Save -->
      <div class="pt-4 border-t border-slate-700/50 flex items-center justify-between gap-4">
        <div class="flex-1">
          <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Total Rewards</div>
          <div class="flex items-center gap-3">
            <span class="text-purple-400 font-bold font-mono text-lg">{{ totalXP }} XP</span>
            <span class="text-slate-700">|</span>
            <span class="text-amber-400 font-bold font-mono text-lg">{{ totalGold }} GP</span>
          </div>
        </div>
        
        <button
          @click="handleSave"
          class="px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center gap-2"
          :class="node.status === 'current' 
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' 
            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'"
        >
          <span>{{ node.status === 'current' ? 'Complete Encounter' : 'Update Results' }}</span>
          <span v-if="node.status === 'current'">➔</span>
          <span v-else>💾</span>
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slideDown {
  animation: slideDown 0.2s ease-out;
}
</style>
