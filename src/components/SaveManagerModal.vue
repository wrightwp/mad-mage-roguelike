<script setup lang="ts">
import { ref } from 'vue';
import { useCampaignStore } from '../stores/useCampaignStore';

defineProps<{
  show: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const campaignStore = useCampaignStore();
const importError = ref<string | null>(null);
const importSuccess = ref<string | null>(null);
const isImporting = ref(false);

const handleExport = () => {
  const json = campaignStore.exportData();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mad-mage-save-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const handleImport = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // Trigger global loading screen immediately
  campaignStore.isLoading = true;
  isImporting.value = true;
  importError.value = null;
  importSuccess.value = null;

  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result as string;
    if (text) {
      setTimeout(() => { // Simulate a small delay for better UX or if processing is instant
          const success = campaignStore.importData(text);
          if (success) {
            importSuccess.value = "Save data imported successfully! reloading...";
            importError.value = null;
            setTimeout(() => window.location.reload(), 1500);
            // Note: We leave campaignStore.isLoading = true because we are about to reload
          } else {
            importError.value = "Failed to import save data. Invalid format.";
            importSuccess.value = null;
            isImporting.value = false;
            // Turn off global loading so user can see error in modal
            campaignStore.isLoading = false;
          }
      }, 500);
    } else {
        isImporting.value = false;
        campaignStore.isLoading = false;
    }
  };
  reader.onerror = () => {
    importError.value = "Failed to read file.";
    isImporting.value = false;
    campaignStore.isLoading = false;
  };
  reader.readAsText(file);
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div class="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-md w-full p-6 relative">
      <h2 class="text-xl font-bold text-amber-500 mb-4 fantasy-header">Save Manager</h2>
      
      <p class="text-sm text-slate-400 mb-6">
        Manage your campaign data. Export to backup or transfer to another device.
      </p>

      <div class="space-y-4">
        <!-- Export -->
        <button 
          @click="handleExport"
          class="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded border border-slate-600 transition-colors"
        >
          <span>💾</span>
          <span>Export Save to File</span>
        </button>

        <!-- Import -->
        <div class="relative">
          <input 
            type="file" 
            accept=".json"
            @change="handleImport"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <button class="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded border border-slate-600 transition-colors pointer-events-none">
            <span>📂</span>
            <span>Import Save from File</span>
          </button>
        </div>

        <!-- Status Messages -->
        <div v-if="isImporting" class="text-amber-400 text-sm text-center bg-amber-900/20 p-2 rounded flex items-center justify-center gap-2">
            <svg class="animate-spin h-4 w-4 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Importing save data...</span>
        </div>
        <div v-if="importError" class="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">
          {{ importError }}
        </div>
        <div v-if="importSuccess" class="text-emerald-400 text-sm text-center bg-emerald-900/20 p-2 rounded">
          {{ importSuccess }}
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="mt-8 flex justify-end">
        <button 
          @click="$emit('close')"
          class="text-slate-400 hover:text-white transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>
