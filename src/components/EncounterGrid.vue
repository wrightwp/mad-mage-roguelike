<script setup lang="ts">
import { ref, computed } from 'vue';
import { encounterLibrary } from '../data/encounterLibrary';
import type { EncounterData } from '../types';
import { EncounterType } from '../types';

interface Props {
  mapData: any;
  selectedNode: any;
  revealAll: boolean;
}

interface Emits {
  (e: 'selectEncounter', node: any): void;
}

defineProps<Props>();
defineEmits<Emits>();

// Get all encounters from the library
const allEncounters = ref<EncounterData[]>([]);

// Load all encounters on mount
const loadEncounters = () => {
  // Get all encounters from the library
  const encounters: EncounterData[] = [];
  
  // Since we can't easily iterate through all encounters, we'll use the count
  // and try to get encounters by type
  for (const type of Object.values(EncounterType)) {
    const typeEncounters = encounterLibrary.getEncountersByType(type);
    encounters.push(...typeEncounters);
  }
  
  // Remove duplicates
  const uniqueEncounters = Array.from(
    new Map(encounters.map(e => [e.name, e])).values()
  );
  
  allEncounters.value = uniqueEncounters;
};

loadEncounters();

// Sorting state
type SortColumn = 'name' | 'type' | 'difficulty' | 'level' | 'xp';
const sortBy = ref<SortColumn>('level');
const sortDirection = ref<'asc' | 'desc'>('asc');

// Toggle sort column
const toggleSort = (column: SortColumn) => {
  if (sortBy.value === column) {
    // Toggle direction if same column
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    // New column, default to ascending
    sortBy.value = column;
    sortDirection.value = 'asc';
  }
};

// Helper to get XP safely
const getXP = (encounter: EncounterData): number => {
  if (encounter.type === EncounterType.Combat || 
      encounter.type === EncounterType.Puzzle || 
      encounter.type === EncounterType.Social ||
      encounter.type === EncounterType.Exploration) {
    return encounter.xpBudget || 0;
  }
  return 0;
};

// Sorted encounters
const sortedEncounters = computed(() => {
  const sorted = [...allEncounters.value].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy.value) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'difficulty':
        const difficultyOrder = { low: 1, moderate: 2, high: 3 };
        const aDiff = difficultyOrder[a.difficulty.toLowerCase() as keyof typeof difficultyOrder] || 0;
        const bDiff = difficultyOrder[b.difficulty.toLowerCase() as keyof typeof difficultyOrder] || 0;
        comparison = aDiff - bDiff;
        break;
      case 'level':
        comparison = a.level - b.level;
        break;
      case 'xp':
        comparison = getXP(a) - getXP(b);
        break;
    }
    
    return sortDirection.value === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
});

// Track expanded rows
const expandedRows = ref<Set<string>>(new Set());

const toggleRow = (encounterName: string) => {
  if (expandedRows.value.has(encounterName)) {
    expandedRows.value.delete(encounterName);
  } else {
    expandedRows.value.add(encounterName);
  }
};

const isExpanded = (encounterName: string) => {
  return expandedRows.value.has(encounterName);
};

// Get encounter type badge color
const getTypeColor = (type: EncounterType): string => {
  switch (type) {
    case EncounterType.Combat: return 'bg-red-600';
    case EncounterType.Exploration: return 'bg-blue-600';
    case EncounterType.Social: return 'bg-purple-600';
    case EncounterType.Puzzle: return 'bg-cyan-600';
    case EncounterType.Rest: return 'bg-amber-800';
    default: return 'bg-slate-600';
  }
};

// Get difficulty color
const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty.toLowerCase()) {
    case 'low': return 'text-green-400';
    case 'moderate': return 'text-yellow-400';
    case 'high': return 'text-red-400';
    default: return 'text-slate-400';
  }
};

// Calculate total monster count
const getTotalMonsters = (encounter: EncounterData): number => {
  if (encounter.type === EncounterType.Combat || encounter.type === EncounterType.Social) {
    return encounter.monsters.reduce((sum, m) => sum + (m.count || 1), 0);
  }
  return 0;
};
</script>

<template>
  <div class="flex-1 overflow-y-auto custom-scrollbar">
    <!-- Header -->
    <div class="p-4 pb-3 border-b border-slate-800 bg-slate-950/50">
      <div class="text-sm text-slate-400">
        {{ allEncounters.length }} total encounter{{ allEncounters.length !== 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Column Headers -->
    <div v-if="allEncounters.length > 0" class="px-4 py-2 bg-slate-900/50 border-b border-slate-800 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-500">
      <div class="w-6"></div> <!-- Spacer for expand icon -->
      
      <button 
        @click="toggleSort('name')"
        class="flex-1 min-w-0 text-left hover:text-amber-400 transition-colors flex items-center gap-1"
      >
        <span>Name</span>
        <span v-if="sortBy === 'name'" class="text-amber-400">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
      </button>
      
      <button 
        @click="toggleSort('type')"
        class="flex-shrink-0 hover:text-amber-400 transition-colors flex items-center gap-1"
      >
        <span>Type</span>
        <span v-if="sortBy === 'type'" class="text-amber-400">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
      </button>
      
      <button 
        @click="toggleSort('difficulty')"
        class="flex-shrink-0 w-16 text-right hover:text-amber-400 transition-colors flex items-center justify-end gap-1"
      >
        <span>Diff</span>
        <span v-if="sortBy === 'difficulty'" class="text-amber-400">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
      </button>
      
      <button 
        @click="toggleSort('level')"
        class="flex-shrink-0 w-12 text-right hover:text-amber-400 transition-colors flex items-center justify-end gap-1"
      >
        <span>Lvl</span>
        <span v-if="sortBy === 'level'" class="text-amber-400">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
      </button>
      
      <button 
        @click="toggleSort('xp')"
        class="flex-shrink-0 w-16 text-right hover:text-amber-400 transition-colors flex items-center justify-end gap-1"
      >
        <span>XP</span>
        <span v-if="sortBy === 'xp'" class="text-amber-400">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
      </button>
    </div>

    <!-- Table -->
    <div v-if="allEncounters.length > 0" class="divide-y divide-slate-800">
      <div
        v-for="encounter in sortedEncounters"
        :key="encounter.name"
        class="hover:bg-slate-800/30 transition-colors"
      >
        <!-- Table Row (Clickable) -->
        <div
          @click="toggleRow(encounter.name)"
          class="px-4 py-3 cursor-pointer flex items-center gap-3 select-none"
        >
          <!-- Expand Icon -->
          <div class="text-slate-500 transition-transform" :class="isExpanded(encounter.name) ? 'rotate-90' : ''">
            ▶
          </div>
          
          <!-- Name -->
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-sm text-slate-200 truncate">
              {{ encounter.name }}
            </div>
          </div>
          
          <!-- Type Badge -->
          <span 
            class="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider flex-shrink-0"
            :class="getTypeColor(encounter.type)"
          >
            {{ encounter.type }}
          </span>
          
          <!-- Difficulty -->
          <span 
            class="text-[10px] font-bold uppercase tracking-wider flex-shrink-0 w-16 text-right"
            :class="getDifficultyColor(encounter.difficulty)"
          >
            {{ encounter.difficulty }}
          </span>
          
          <!-- Level -->
          <div class="text-xs text-slate-500 flex-shrink-0 w-12 text-right">
            Lvl {{ encounter.level }}
          </div>
          
          <!-- XP -->
          <div class="text-xs text-slate-500 flex-shrink-0 w-16 text-right">
            {{ getXP(encounter) }} XP
          </div>
        </div>

        <!-- Expanded Details -->
        <div
          v-if="isExpanded(encounter.name)"
          class="px-4 pb-4 pt-2 bg-slate-900/40 border-t border-slate-800/50 space-y-3 animate-slideDown"
        >
          <!-- DM Description -->
          <div v-if="encounter.dmDescription" class="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
            <div class="text-[10px] text-red-400 uppercase tracking-widest mb-2 font-bold">🎲 DM Notes</div>
            <p class="text-xs text-slate-300 leading-relaxed">
              {{ encounter.dmDescription }}
            </p>
          </div>

          <!-- Monsters (for combat/social encounters) -->
          <div v-if="(encounter.type === EncounterType.Combat || encounter.type === EncounterType.Social) && encounter.monsters && encounter.monsters.length > 0" class="bg-red-900/10 rounded-lg p-3 border border-red-900/30">
            <div class="text-[10px] text-red-400 uppercase tracking-widest mb-2 font-bold">Enemies ({{ getTotalMonsters(encounter) }} total)</div>
            <div class="space-y-1.5">
              <div
                v-for="monster in encounter.monsters"
                :key="monster.name"
                class="flex items-center justify-between bg-slate-900/40 rounded-lg p-2 border border-slate-700/30"
              >
                <span class="text-xs text-slate-300">
                  <span class="text-red-300 font-bold pr-3 select-none">{{ monster.count }}</span>
                  <span>{{ monster.name }}</span>
                  <span class="text-slate-500 ml-2">(CR {{ monster.cr }})</span>
                </span>
                <a
                  :href="monster.mmLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  @click.stop
                  class="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded transition-colors"
                >
                  📖
                </a>
              </div>
            </div>
          </div>

          <!-- Additional Stats -->
          <div class="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
            <div v-if="(encounter.type === EncounterType.Combat || encounter.type === EncounterType.Social) && encounter.attitude">
              <span class="text-slate-500">Attitude:</span> <span class="capitalize">{{ encounter.attitude }}</span>
            </div>
            <div v-if="(encounter.type === EncounterType.Combat || encounter.type === EncounterType.Social) && encounter.personality">
              <span class="text-slate-500">Personality:</span> <span class="capitalize">{{ encounter.personality }}</span>
            </div>
            <div v-if="encounter.lair !== undefined">
              <span class="text-slate-500">Lair:</span> {{ encounter.lair ? 'Yes' : 'No' }}
            </div>
            <div v-if="encounter.size">
              <span class="text-slate-500">Size:</span> {{ encounter.size }}
            </div>
          </div>

          <!-- Win Conditions -->
          <div v-if="encounter.winConditions && encounter.winConditions.length > 0" class="bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-lg p-3 border border-slate-700">
            <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-bold">Win Conditions</div>
            <div class="space-y-2">
              <div
                v-for="(winCondition, index) in encounter.winConditions"
                :key="index"
                class="rounded-lg p-2 border-l-4 bg-slate-900/40"
                :class="index === 0 ? 'border-emerald-500 bg-emerald-900/5' : 'border-amber-500 bg-amber-900/5'"
              >
                <div class="text-xs font-semibold mb-1" :class="index === 0 ? 'text-emerald-300' : 'text-amber-300'">
                  {{ winCondition.condition }}
                </div>
                <div class="text-[10px] text-slate-400">
                  <span class="font-semibold">Reward:</span> {{ winCondition.reward }}
                </div>
              </div>
            </div>
          </div>

          <!-- AI Room Prompt -->
          <div v-if="encounter.aiRoomPrompt" class="bg-purple-900/10 rounded-lg p-3 border border-purple-900/30">
            <div class="text-[10px] text-purple-400 uppercase tracking-widest mb-2 font-bold">🤖 AI Room Prompt</div>
            <div class="text-xs text-slate-300 bg-slate-900/40 rounded-lg p-2 border border-slate-700/30 font-mono leading-relaxed">
              {{ encounter.aiRoomPrompt }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center py-12 text-center opacity-30">
      <div class="text-4xl mb-3">📚</div>
      <p class="text-sm text-slate-500 uppercase tracking-widest">
        No encounters loaded
      </p>
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

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 2000px;
  }
}

.animate-slideDown {
  animation: slideDown 0.3s ease-out;
}
</style>
