
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useCampaignStore } from './stores/useCampaignStore';
import DungeonMap from './components/DungeonMap.vue'

const campaignStore = useCampaignStore();
const startupLoading = ref(true);

const isLoading = computed(() => startupLoading.value || campaignStore.isLoading);

onMounted(async () => {
  // Simulate checking/loading delay for visual feedback
  await new Promise(resolve => setTimeout(resolve, 800));

  // Simple check: if no campaigns, create one.
  if (campaignStore.campaigns.length === 0) {
    campaignStore.createCampaign('Default Campaign');
  } else if (!campaignStore.activeCampaignId) {
    // Select the first one if none selected
    campaignStore.selectCampaign(campaignStore.campaigns[0].id);
  }
  
  startupLoading.value = false;
});
</script>

<template>
  <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-amber-500 font-bold tracking-widest flex-col gap-4">
    <div class="text-2xl fantasy-header animate-pulse">Loading Dungeon...</div>
    <div class="text-sm text-slate-500">Checking local grimoires</div>
  </div>
  <DungeonMap v-else />
</template>

<style scoped>
</style>
