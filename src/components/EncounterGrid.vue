<script setup lang="ts">
import { ref, computed } from 'vue';
import { encounterLibrary } from '../data/encounterLibrary';
import type { EncounterData } from '../types';
import { EncounterType } from '../types';
import EncounterContent from './EncounterContent.vue';
import EncounterFeedbackPanel from './EncounterFeedbackPanel.vue';

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

// Filter state
const nameFilter = ref('');
const typeFilter = ref<EncounterType | 'all'>('all');

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
      encounter.type === EncounterType.Social ||
      encounter.type === EncounterType.Exploration ||
      encounter.type === EncounterType.Treasure) {
    return encounter.xpBudget || 0;
  }
  return 0;
};

const filteredEncounters = computed(() => {
  const nameQuery = nameFilter.value.trim().toLowerCase();
  const typeQuery = typeFilter.value;

  return allEncounters.value.filter(encounter => {
    const matchesName = nameQuery.length === 0 || encounter.name.toLowerCase().includes(nameQuery);
    const matchesType = typeQuery === 'all' || encounter.type === typeQuery;
    return matchesName && matchesType;
  });
});

const isFiltered = computed(() => {
  return nameFilter.value.trim().length > 0 || typeFilter.value !== 'all';
});

// Sorted encounters
const sortedEncounters = computed(() => {
  const sorted = [...filteredEncounters.value].sort((a, b) => {
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
    case EncounterType.Rest: return 'bg-amber-800';
    case EncounterType.Treasure: return 'bg-amber-500';
    default: return 'bg-slate-600';
  }
};

const clearFilters = () => {
  nameFilter.value = '';
  typeFilter.value = 'all';
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


</script>

<template>
  <div class="flex-1 overflow-y-auto custom-scrollbar">
    <!-- Header -->
    <div class="p-4 pb-3 border-b border-slate-800 bg-slate-950/50">
      <div class="text-sm text-slate-400">
        <span v-if="isFiltered">
          {{ filteredEncounters.length }} of {{ allEncounters.length }} encounters
        </span>
        <span v-else>
          {{ allEncounters.length }} total encounter{{ allEncounters.length !== 1 ? 's' : '' }}
        </span>
      </div>
    </div>

    <!-- Filters -->
    <div class="px-4 py-3 border-b border-slate-800 bg-slate-900/40">
      <div class="flex items-end gap-3">
        <div class="flex-1">
          <label class="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Name</label>
          <input
            v-model="nameFilter"
            type="text"
            placeholder="Filter by name..."
            class="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        <div class="w-44">
          <label class="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Type</label>
          <select
            v-model="typeFilter"
            class="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="all">All Types</option>
            <option v-for="type in Object.values(EncounterType)" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
        <button
          v-if="isFiltered"
          @click="clearFilters"
          class="px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-amber-500/60 hover:bg-slate-800/60 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Column Headers -->
    <div v-if="allEncounters.length > 0" class="px-4 py-2 bg-slate-900/50 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 grid items-center grid-cols-[24px_minmax(140px,1fr)_minmax(72px,auto)_minmax(0,40px)] md:grid-cols-[24px_minmax(140px,1fr)_minmax(72px,auto)_minmax(0,48px)_minmax(0,40px)_minmax(0,48px)]">
      <div class="w-6"></div> <!-- Spacer for expand icon -->
      
      <button 
        @click="toggleSort('name')"
        class="w-full min-w-0 text-left hover:text-amber-400 transition-colors flex items-center gap-1"
      >
        <span>Name</span>
        <span v-if="sortBy === 'name'" class="text-amber-400">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
      </button>
      
      <button 
        @click="toggleSort('type')"
        class="w-full min-w-[72px] hover:text-amber-400 transition-colors flex items-center justify-center gap-1"
      >
        <span>Type</span>
        <span v-if="sortBy === 'type'" class="text-amber-400">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
      </button>
      
      <button 
        @click="toggleSort('difficulty')"
        class="w-full text-right hover:text-amber-400 transition-colors items-center justify-end gap-1 hidden md:flex"
      >
        <span>Diff</span>
        <span v-if="sortBy === 'difficulty'" class="text-amber-400">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
      </button>
      
      <button 
        @click="toggleSort('level')"
        class="w-full text-right hover:text-amber-400 transition-colors flex items-center justify-end gap-1"
      >
        <span>Lvl</span>
        <span v-if="sortBy === 'level'" class="text-amber-400">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
      </button>
      
      <button 
        @click="toggleSort('xp')"
        class="w-full text-right hover:text-amber-400 transition-colors items-center justify-end gap-1 hidden md:flex"
        title="XP Budget"
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
          class="px-4 py-3 cursor-pointer select-none grid items-center grid-cols-[24px_minmax(140px,1fr)_minmax(72px,auto)_minmax(0,40px)] md:grid-cols-[24px_minmax(140px,1fr)_minmax(72px,auto)_minmax(0,48px)_minmax(0,40px)_minmax(0,48px)]"
        >
          <!-- Expand Icon -->
          <div class="text-slate-500 transition-transform" :class="isExpanded(encounter.name) ? 'rotate-90' : ''">
            ▶
          </div>
          
          <!-- Name -->
          <div class="flex-1 min-w-[140px]">
            <div class="font-semibold text-sm text-slate-200 leading-snug whitespace-normal">
              {{ encounter.name }}
            </div>
          </div>
          
          <!-- Type Badge -->
          <span 
            class="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider flex-shrink-0 min-w-[72px] text-center"
            :class="getTypeColor(encounter.type)"
          >
            {{ encounter.type }}
          </span>
          
          <!-- Difficulty -->
          <span 
            class="text-[9px] font-bold uppercase tracking-wider flex-shrink-0 w-12 text-right hidden md:block"
            :class="getDifficultyColor(encounter.difficulty)"
          >
            {{ encounter.difficulty }}
          </span>
          
          <!-- Level -->
          <div class="text-[10px] text-slate-500 flex-shrink-0 w-10 text-right">
            Lvl {{ encounter.level }}
          </div>
          
          <!-- XP -->
          <div class="text-[10px] text-slate-500 flex-shrink-0 w-12 text-right hidden md:block">
            {{ getXP(encounter) }} XP
          </div>
        </div>

        <!-- Expanded Details -->
        <div
          v-if="isExpanded(encounter.name)"
          class="px-4 pb-4 pt-2 bg-slate-900/40 border-t border-slate-800/50 space-y-3 animate-slideDown"
        >
          <EncounterContent :encounter="encounter" :show-room-description="true" />
          <EncounterFeedbackPanel
            :encounter="encounter"
            :floor="encounter.level ?? null"
          />
        </div>
      </div>
    </div>

    <div v-if="allEncounters.length > 0 && sortedEncounters.length === 0" class="flex flex-col items-center justify-center py-10 text-center text-slate-500">
      <div class="text-base font-semibold mb-1">No matches</div>
      <p class="text-xs uppercase tracking-widest">Adjust filters to see encounters</p>
    </div>

    <!-- Empty State -->
    <div v-if="allEncounters.length === 0" class="flex flex-col items-center justify-center py-12 text-center opacity-30">
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


