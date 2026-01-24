<script setup lang="ts">
import { ref } from 'vue';
import type { DungeonNode } from '../types';
import headerDecoration from '../assets/header_decoration.png';
import SaveManagerModal from './SaveManagerModal.vue';
import SidebarTabs from './SidebarTabs.vue';
import DungeonSettingsPanel from './DungeonSettingsPanel.vue';
import EncounterDetails from './EncounterDetails.vue';
import EncounterGrid from './EncounterGrid.vue';

interface Props {
  width: number;
  floorCount: number;
  currentFloor: number;
  revealAll: boolean;
  mapData: any; // DungeonMapData
  selectedNode: DungeonNode | null;
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
  (e: 'enterEncounter', node: DungeonNode): void;
  (e: 'completeEncounter', node: DungeonNode): void;
  (e: 'selectNode', nodeId: string): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const showSaveManager = ref(false);
type TabKey = 'settings' | 'details' | 'library';
const activeTab = ref<TabKey>('settings');

type TabDef = {
  id: 'settings' | 'details' | 'library';
  label: string;
  icon: 'settings' | 'details' | 'library';
};

const tabs: TabDef[] = [
  { id: 'settings', label: 'Dungeon Settings', icon: 'settings' },
  { id: 'details', label: 'Current Encounter', icon: 'details' },
  { id: 'library', label: 'Encounter Library', icon: 'library' }
];

const handleSelectEncounter = (node: DungeonNode) => {
  emit('selectNode', node.id);
  activeTab.value = 'details';
};
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
    
    <SidebarTabs v-model="activeTab" :tabs="tabs" />

    <div class="flex-1 min-h-0 flex flex-col">
      <DungeonSettingsPanel
        v-if="activeTab === 'settings'"
        :floor-count="floorCount"
        :current-floor="currentFloor"
        :reveal-all="revealAll"
        :map-data="mapData"
        :party-size="partySize"
        :average-party-level="averagePartyLevel"
        @update:floor-count="emit('update:floorCount', $event)"
        @update:current-floor="emit('update:currentFloor', $event)"
        @update:reveal-all="emit('update:revealAll', $event)"
        @update:party-size="emit('update:partySize', $event)"
        @update:average-party-level="emit('update:averagePartyLevel', $event)"
        @regenerate="emit('regenerate')"
        @show-floor-summary="emit('showFloorSummary')"
      />

      <EncounterDetails
        v-else-if="activeTab === 'details'"
        :selected-node="selectedNode"
        :reveal-all="revealAll"
        :map-data="mapData"
        @enter-encounter="emit('enterEncounter', $event)"
        @complete-encounter="emit('completeEncounter', $event)"
      />

      <EncounterGrid
        v-else
        :map-data="mapData"
        :selected-node="selectedNode"
        :reveal-all="revealAll"
        @select-encounter="handleSelectEncounter"
      />
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
</style>
