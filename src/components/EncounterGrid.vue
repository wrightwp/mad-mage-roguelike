<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { encounterLibrary } from '../data/encounterLibrary';
import type { EncounterData } from '../types';
import { EncounterType } from '../types';
import { monsterLibrary } from '../data/monsterLibrary';
import CreateEncounterModal from './CreateEncounterModal.vue';
import EncounterContent from './EncounterContent.vue';
import EncounterFeedbackPanel from './EncounterFeedbackPanel.vue';
import { useEncounterFeedbackStore } from '../stores/useEncounterFeedbackStore';

const feedbackStore = useEncounterFeedbackStore();
const showCreateModal = ref(false);

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

  // Add custom encounters from feedback store
  // Add custom encounters from feedback store
  const customEncounters = feedbackStore.feedbackList
    .filter(entry => entry.key.startsWith('custom-'))
    .map(entry => {
      // Hydrate monsters if they are missing data (e.g. just id/count)
      const enc = { ...entry.edited };
      if ((enc as any).monsters) {
         (enc as any).monsters = (enc as any).monsters.map((m: any) => {
             // Already fully hydrated?
             if (m.name && m.exp && m.mmLink) return m;
             
             // Try to find in library
             if (m.id) {
                 const libMonster = monsterLibrary.getMonsterById(m.id);
                 if (libMonster) {
                     return { ...libMonster, count: m.count || 1 };
                 }
             }
             // Fallback
             return m;
         });
      }
      return enc;
    });
    
  // Merge custom encounters
  // We prioritize custom encounters if there's a name collision, though there shouldn't be with unique naming
  allEncounters.value = [...uniqueEncounters, ...customEncounters];
};

loadEncounters();

// Watch for changes in feedback store to update list (e.g. if name changes or new one added)
// Note: We need deep watch or watch the list length/contents
watch(() => feedbackStore.feedbackList, () => {
  loadEncounters();
}, { deep: true });

const createNewEncounter = () => {
  showCreateModal.value = true;
};

const handleEncounterCreated = (encounter: EncounterData) => {
  // Force expand the new row and filter to it so the user sees it
  // We need to wait for the watch to trigger and update the list (which happens in the modal save)
  setTimeout(() => {
    clearFilters();
    nameFilter.value = encounter.name;
    if (!expandedRows.value.has(encounter.name)) {
      expandedRows.value.add(encounter.name);
    }
  }, 100);
};

// Sorting state
type SortColumn = 'name' | 'type' | 'difficulty' | 'level' | 'xp' | 'tier';
const sortBy = ref<SortColumn>('level');
const sortDirection = ref<'asc' | 'desc'>('asc');

// Filter state
const nameFilter = ref('');
const typeFilter = ref<EncounterType | 'all'>('all');
const tierFilter = ref<number | 'all'>('all');

// Helper to get Tier
const getTier = (encounter: EncounterData): number => {
  if (encounter.tier) return encounter.tier;
  if (encounter.level <= 4) return 1;
  if (encounter.level <= 10) return 2;
  if (encounter.level <= 16) return 3; // Adjusted to standard play tiers roughly (1-4, 5-10, 11-16, 17-20)
  return 4;
};

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
  const tierQuery = tierFilter.value;

  return allEncounters.value.filter(encounter => {
    const matchesName = nameQuery.length === 0 || encounter.name.toLowerCase().includes(nameQuery);
    const matchesType = typeQuery === 'all' || encounter.type === typeQuery;
    const matchesTier = tierQuery === 'all' || getTier(encounter) === tierQuery;
    return matchesName && matchesType && matchesTier;
  });
});

const isFiltered = computed(() => {
  return nameFilter.value.trim().length > 0 || typeFilter.value !== 'all' || tierFilter.value !== 'all';
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
      case 'tier':
        comparison = getTier(a) - getTier(b);
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
  tierFilter.value = 'all';
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

const encounterStats = computed(() => {
  const stats: Record<number, { total: number; byType: Record<string, number> }> = {};

  allEncounters.value.forEach(enc => {
    const tier = getTier(enc);
    
    if (!stats[tier]) {
      stats[tier] = { total: 0, byType: {} };
    }
    
    stats[tier].total++;
    const type = enc.type;
    stats[tier].byType[type] = (stats[tier].byType[type] || 0) + 1;
  });

  return stats;
});


</script>

<template>
  <div class="flex-1 overflow-y-auto custom-scrollbar">
    <!-- Header -->
    <div class="p-4 pb-3 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
      <div class="text-sm text-slate-400">
        <span v-if="isFiltered">
          {{ filteredEncounters.length }} of {{ allEncounters.length }} encounters
        </span>
        <span v-else>
          {{ allEncounters.length }} total encounter{{ allEncounters.length !== 1 ? 's' : '' }}
        </span>
      </div>
      <button 
        @click="createNewEncounter"
        class="px-3 py-1.5 bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 text-xs font-bold uppercase tracking-wider rounded border border-emerald-600/50 flex items-center gap-1 transition-colors shadow-sm ml-4"
      >
        <span>+</span> Add Encounter
      </button>
    </div>

    <!-- Create Encounter Modal -->
    <teleport to="body">
      <CreateEncounterModal 
        :show="showCreateModal" 
        @close="showCreateModal = false"
        @created="handleEncounterCreated"
      />
    </teleport>

    <!-- Tier Statistics -->
    <div v-if="!isFiltered && allEncounters.length > 0" class="px-4 py-3 border-b border-slate-800 bg-slate-900/30 text-xs shadow-inner">
      <h3 class="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">Instance Statistics</h3>
      <div class="flex flex-wrap gap-4">
        <div v-for="(stat, tier) in encounterStats" :key="tier" class="mb-0 bg-slate-950/50 rounded px-2 py-1.5 border border-slate-800/50 min-w-[120px]">
          <div class="flex justify-between items-center mb-1 border-b border-slate-800 pb-1">
            <span class="text-amber-500 font-bold text-[10px] uppercase">Tier {{ tier }}</span>
            <span class="text-slate-400 text-[10px]">{{ stat.total }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <div v-for="(count, type) in stat.byType" :key="type" class="flex items-center justify-between gap-1.5">
              <span class="text-[9px] text-slate-400">{{ type }}</span>
              <span class="text-[9px] text-slate-300">{{ count }}</span>
            </div>
          </div>
        </div>
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
        <div class="w-32">
          <label class="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Tier</label>
          <select
            v-model="tierFilter"
            class="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="all">All Tiers</option>
            <option :value="1">Tier 1 (1-4)</option>
            <option :value="2">Tier 2 (5-10)</option>
            <option :value="3">Tier 3 (11-16)</option>
            <option :value="4">Tier 4 (17-20)</option>
          </select>
        </div>
        <div class="w-32">
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
    <div v-if="allEncounters.length > 0" class="px-4 py-2 bg-slate-900/50 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 grid items-center grid-cols-[24px_1fr_72px_40px_40px] md:grid-cols-[24px_1fr_80px_48px_64px_48px_64px]">
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
        @click="toggleSort('tier')"
        class="w-full text-center hover:text-amber-400 transition-colors flex items-center justify-center gap-1"
      >
        <span>Tier</span>
        <span v-if="sortBy === 'tier'" class="text-amber-400">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
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
          class="px-4 py-3 cursor-pointer select-none grid items-center grid-cols-[24px_1fr_72px_40px_40px] md:grid-cols-[24px_1fr_80px_48px_64px_48px_64px]"
        >
          <!-- Expand Icon -->
          <!-- Expand Icon -->
          <div class="text-slate-500 transition-transform duration-200" :class="isExpanded(encounter.name) ? 'rotate-90' : ''">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          
          <!-- Name -->
          <div class="flex-1 min-w-[140px] pl-2">
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

          <!-- Tier -->
          <div class="text-[10px] text-slate-400 font-mono text-center w-10 mx-auto">
             T{{ getTier(encounter) }}
          </div>
          
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


