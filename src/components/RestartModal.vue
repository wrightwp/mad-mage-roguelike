<script setup lang="ts">
interface Props {
  show: boolean;
}

interface Emits {
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();
</script>

<template>
  <div 
    v-if="show" 
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
  >
    <div class="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all scale-100">
      <div class="w-16 h-16 bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">⚠️</div>
      <h3 class="text-2xl font-bold text-slate-100 mb-2">Reset Journey?</h3>
      <p class="text-slate-400 text-sm mb-8 leading-relaxed">All progress in this descent will be lost. The Undermountain will shift and reshape itself.</p>
      <div class="flex gap-4">
        <button 
          @click="emit('cancel')"
          class="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-xl transition-colors border border-slate-700"
        >
          Stay
        </button>
        <button 
          @click="emit('confirm')"
          class="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-red-900/40"
        >
          Reset
        </button>
      </div>
    </div>
  </div>
</template>
