import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { EncounterData } from '../types';

export interface EncounterFeedbackEntry {
  key: string;
  encounterName: string;
  encounterType: string;
  floor: number | null;
  source?: {
    nodeId?: string;
    mapId?: string;
  };
  original: EncounterData;
  edited: EncounterData;
  notes?: string;
  editedAt: string;
}

interface EncounterFeedbackExport {
  version: number;
  generatedAt: string;
  appVersion: string;
  encounters: EncounterFeedbackEntry[];
}

const STORAGE_KEY = 'mad_mage_encounter_feedback_v1';
const APP_VERSION = import.meta.env?.VITE_APP_VERSION ?? 'dev';

export const useEncounterFeedbackStore = defineStore('encounterFeedback', () => {
  const feedbackByKey = ref<Record<string, EncounterFeedbackEntry>>({});

  const feedbackList = computed(() => Object.values(feedbackByKey.value));
  const feedbackCount = computed(() => feedbackList.value.length);

  const load = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      feedbackByKey.value = JSON.parse(raw);
    } catch (err) {
      console.error('Failed to parse encounter feedback', err);
      feedbackByKey.value = {};
    }
  };

  const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbackByKey.value));
  };

  const getEntry = (key: string): EncounterFeedbackEntry | undefined => {
    return feedbackByKey.value[key];
  };

  const saveEntry = (entry: EncounterFeedbackEntry) => {
    feedbackByKey.value[entry.key] = entry;
    persist();
  };

  const removeEntry = (key: string) => {
    if (feedbackByKey.value[key]) {
      delete feedbackByKey.value[key];
      persist();
    }
  };

  const clearAll = () => {
    feedbackByKey.value = {};
    persist();
  };

  const exportAndDownload = () => {
    const payload: EncounterFeedbackExport = {
      version: 1,
      generatedAt: new Date().toISOString(),
      appVersion: String(APP_VERSION),
      encounters: feedbackList.value
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `encounter-feedback-${payload.generatedAt.replace(/[:.]/g, '-')}.json`;
    anchor.click();
    URL.revokeObjectURL(url);

    clearAll();
  };

  load();

  return {
    feedbackByKey,
    feedbackList,
    feedbackCount,
    getEntry,
    saveEntry,
    removeEntry,
    clearAll,
    exportAndDownload
  };
});
