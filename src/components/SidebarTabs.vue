<script setup lang="ts">
interface Tab {
  id: string;
  label: string;
  icon?: 'settings' | 'details' | 'library';
}

interface Props {
  modelValue: string;
  tabs: Tab[];
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();
</script>

<template>
  <div class="flex border-b border-slate-800 bg-slate-950/50">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      @click="emit('update:modelValue', tab.id)"
      class="flex-1 px-4 py-3 text-[12px] font-bold uppercase tracking-wider transition-all relative"
      :class="modelValue === tab.id
        ? 'text-amber-400 bg-slate-900/50'
        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'"
    >
      <span class="relative z-10 flex items-center justify-center gap-2">
        <svg
          v-if="tab.icon === 'settings'"
          viewBox="0 0 24 24"
          class="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V22a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H8a1.65 1.65 0 0 0 1-1.51V2a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V8c0 .64.38 1.23 1 1.51.3.13.63.2.96.2H22a2 2 0 1 1 0 4h-.09c-.33 0-.66.07-.96.2-.62.28-1 0.87-1 1.51z" />
        </svg>
        <svg
          v-else-if="tab.icon === 'details'"
          viewBox="0 0 24 24"
          class="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
        <svg
          v-else-if="tab.icon === 'library'"
          viewBox="0 0 24 24"
          class="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M4 19a2 2 0 0 1 2-2h12" />
          <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 1-2-2z" />
        </svg>
        <span>{{ tab.label }}</span>
      </span>
      <div
        v-if="modelValue === tab.id"
        class="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400"
      ></div>
    </button>
  </div>
</template>
