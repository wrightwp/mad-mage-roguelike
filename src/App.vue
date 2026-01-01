<script setup lang="ts">
import HexGrid from './components/HexGrid.vue';
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-8 text-neutral-200">
    <h1 class="text-4xl font-bold mb-8 text-emerald-400 drop-shadow-lg">Mad Mage Roguelike</h1>
    <HexGrid :width="800" :height="600" :hex-size="25" />
    <p class="mt-4 text-neutral-500">Click on a tile to inspect</p>
  </div>
</template>

<style scoped>
</style>
