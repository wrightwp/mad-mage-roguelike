<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { EncounterData } from '../types';
import { EncounterType, EncounterDifficulty } from '../types';
import { useEncounterFeedbackStore } from '../stores/useEncounterFeedbackStore';

interface Props {
  encounter: EncounterData;
  floor?: number | null;
  nodeId?: string;
}

const props = defineProps<Props>();
const feedbackStore = useEncounterFeedbackStore();

const notes = ref('');
const draftEncounter = ref<EncounterData>(cloneEncounter(props.encounter));
const showEditor = ref(false);
const showRawJson = ref(false);
const jsonText = ref('');
const jsonError = ref<string | null>(null);

const feedbackKey = computed(() => {
  const base = props.encounter.id || `${props.floor ?? props.encounter.level}|${props.encounter.type}|${props.encounter.name}`;
  return base;
});

const existingEntry = computed(() => feedbackStore.getEntry(feedbackKey.value));
const hasSavedFeedback = computed(() => !!existingEntry.value);
const xpBudgetValue = computed({
  get: () => (draftEncounter.value as any).xpBudget ?? 0,
  set: (value: number) => {
    (draftEncounter.value as any).xpBudget = value;
  }
});

function cloneEncounter<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

const hydrateFromEntry = () => {
  const entry = existingEntry.value;
  draftEncounter.value = cloneEncounter(entry?.edited ?? props.encounter);
  notes.value = entry?.notes ?? '';
  jsonText.value = '';
  jsonError.value = null;
  showRawJson.value = false;
};

watch(
  () => [props.encounter, feedbackKey.value],
  () => {
    hydrateFromEntry();
  },
  { immediate: true }
);

const openRawJson = () => {
  jsonText.value = JSON.stringify(draftEncounter.value, null, 2);
  jsonError.value = null;
  showRawJson.value = true;
};

const applyRawJson = () => {
  try {
    const parsed = JSON.parse(jsonText.value);
    draftEncounter.value = parsed;
    jsonError.value = null;
  } catch (err) {
    jsonError.value = 'Invalid JSON. Please fix formatting before applying.';
  }
};

const saveFeedback = () => {
  const now = new Date().toISOString();
  const original = existingEntry.value?.original ?? cloneEncounter(props.encounter);
  const edited = cloneEncounter(draftEncounter.value);

  feedbackStore.saveEntry({
    key: feedbackKey.value,
    encounterName: edited.name,
    encounterType: edited.type,
    floor: props.floor ?? edited.level ?? null,
    source: props.nodeId ? { nodeId: props.nodeId } : undefined,
    original,
    edited,
    notes: notes.value?.trim() || undefined,
    editedAt: now
  });
};

const resetFeedback = () => {
  feedbackStore.removeEntry(feedbackKey.value);
  draftEncounter.value = cloneEncounter(props.encounter);
  notes.value = '';
  jsonText.value = '';
  jsonError.value = null;
  showRawJson.value = false;
};
</script>

<template>
  <div class="bg-slate-800/40 rounded-xl border border-slate-700">
    <button
      @click="showEditor = !showEditor"
      class="w-full flex items-center justify-between px-4 py-3 text-left bg-slate-900/60 hover:bg-slate-900/80 transition-colors rounded-t-xl"
      type="button"
    >
      <div class="flex items-center gap-2">
        <span class="text-xs transition-transform" :class="showEditor ? 'rotate-0' : '-rotate-90'">▼</span>
        <span class="text-[11px] text-amber-300 uppercase tracking-widest font-bold">Encounter Feedback</span>
      </div>
      <div class="text-[10px] text-slate-400">
        {{ hasSavedFeedback ? 'Saved' : 'Not saved' }}
      </div>
    </button>

    <div v-if="showEditor" class="space-y-4 p-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Name</label>
          <input
            v-model="draftEncounter.name"
            type="text"
            class="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        <div>
          <label class="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Type</label>
          <select
            v-model="draftEncounter.type"
            class="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option v-for="type in Object.values(EncounterType)" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Difficulty</label>
          <select
            v-model="draftEncounter.difficulty"
            class="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option v-for="difficulty in Object.values(EncounterDifficulty)" :key="difficulty" :value="difficulty">
              {{ difficulty }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Level</label>
          <input
            v-model.number="draftEncounter.level"
            type="number"
            class="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        <div>
          <label class="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Size</label>
          <input
            v-model.number="draftEncounter.size"
            type="number"
            class="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        <div>
          <label class="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">XP Budget</label>
          <input
            v-model.number="xpBudgetValue"
            type="number"
            class="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      <div>
        <label class="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Room Description</label>
        <textarea
          v-model="draftEncounter.roomDescription"
          rows="3"
          class="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
        ></textarea>
      </div>

      <div>
        <label class="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">DM Description</label>
        <textarea
          v-model="draftEncounter.dmDescription"
          rows="3"
          class="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
        ></textarea>
      </div>

      <div>
        <label class="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">AI Room Prompt</label>
        <textarea
          v-model="draftEncounter.aiRoomPrompt"
          rows="2"
          class="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
        ></textarea>
      </div>

      <div>
        <label class="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Notes</label>
        <textarea
          v-model="notes"
          rows="2"
          class="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
        ></textarea>
      </div>

      <div class="bg-slate-900/40 rounded-lg border border-slate-700">
        <button
          @click="showRawJson ? applyRawJson() : openRawJson()"
          class="w-full text-left px-3 py-2 text-[11px] uppercase tracking-widest font-bold text-slate-300 hover:text-white"
        >
          {{ showRawJson ? 'Apply JSON to Form' : 'Advanced JSON Editor' }}
        </button>
        <div v-if="showRawJson" class="px-3 pb-3 space-y-2">
          <textarea
            v-model="jsonText"
            rows="8"
            class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          ></textarea>
          <div v-if="jsonError" class="text-xs text-red-400">{{ jsonError }}</div>
        </div>
      </div>

      <div class="flex gap-3">
        <button
          @click="saveFeedback"
          class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg transition-colors"
        >
          Save Feedback
        </button>
        <button
          @click="resetFeedback"
          class="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2.5 rounded-lg transition-colors"
        >
          Reset to Original
        </button>
      </div>
    </div>
  </div>
</template>
