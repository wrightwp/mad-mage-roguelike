<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { generateCharacter, type GeneratedCharacter, type AbilityScores } from '../utils/characterGenerator';

const props = defineProps<{
  show: boolean;
  level?: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const character = ref<GeneratedCharacter | null>(null);
const abilityOrder: (keyof AbilityScores)[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
const abilityEntries = computed(() => {
  if (!character.value) return [] as Array<[keyof AbilityScores, number]>;
  return abilityOrder.map((key) => [key, character.value!.abilityScores[key]] as [keyof AbilityScores, number]);
});

const buildCharacter = () => {
  character.value = generateCharacter(props.level);
};

watch(
  () => props.show,
  (show) => {
    if (show) {
      buildCharacter();
    }
  }
);

const listText = (items: string[], fallback = 'None') => (items.length ? items.join(', ') : fallback);
const bulletText = (items: string[], fallback = 'None') =>
  items.length ? items.map(item => `- ${item}`).join('\n') : fallback;
const formattedText = computed(() => {
  if (!character.value) return '';
  const c = character.value;
  const scores = abilityOrder
    .map((key) => `${key}: ${c.abilityScores[key]} (${c.modifiers[key] >= 0 ? '+' : ''}${c.modifiers[key]})`)
    .join('\n');
  return [
    `Name: ${c.name}`,
    `Level: ${c.level}`,
    `Class: ${c.className}${c.subclass ? ` (${c.subclass})` : ''}`,
    '',
    'Class Inputs',
    bulletText(c.classInputs),
    '',
    'Spells',
    bulletText(c.spells),
    '',
    'Background (Origin)',
    `Background: ${c.background}`,
    `Bonuses: +2 ${c.backgroundBoosts.plus2}, +1 ${c.backgroundBoosts.plus1}`,
    `Origin Feat: ${c.originFeat}${c.originFeatDetail ? ` (${c.originFeatDetail})` : ''}`,
    '',
    'Species (Origin)',
    `Species: ${c.species}`,
    c.ancestry ? `Ancestry: ${c.ancestry}` : 'Ancestry: None',
    `Languages: ${listText(c.languages)}`,
    '',
    'Ability Scores',
    scores
  ].join('\n');
});

const copyToClipboard = async () => {
  if (!formattedText.value) return;
  try {
    await navigator.clipboard.writeText(formattedText.value);
  } catch (err) {
    console.error('Failed to copy character', err);
  }
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="bg-slate-900 border-2 border-amber-600/50 rounded-2xl p-0 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
      <div class="p-6 pb-4 bg-slate-950 border-b border-amber-900/50">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-2xl font-bold text-amber-400 tracking-wider">Random Character</h2>
            <div class="text-xs text-slate-500 uppercase tracking-widest mt-1">2024 Core Rules Format</div>
          </div>
          <button
            @click="emit('close')"
            class="text-slate-500 hover:text-white transition-colors text-2xl leading-none"
          >
            X
          </button>
        </div>
        <div class="mt-4 flex gap-3">
          <button
            @click="buildCharacter"
            class="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
          >
            Generate New
          </button>
          <button
            @click="copyToClipboard"
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
          >
            Copy for DnD Beyond
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
        <div v-if="character" class="space-y-4 text-sm text-slate-200">
          <div class="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
            <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Character Name</div>
            <div class="text-lg font-semibold text-slate-100">{{ character.name }}</div>
          </div>

          <div class="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
            <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Class</div>
            <div class="text-lg font-semibold text-slate-100">
              {{ character.className }}<span v-if="character.subclass" class="text-slate-400 text-sm"> ({{ character.subclass }})</span>
            </div>
            <div class="mt-3 text-sm">
              <div><span class="text-slate-400">Level:</span> {{ character.level }}</div>
            </div>
          </div>

          <div class="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
            <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Class Inputs</div>
            <ul class="list-disc list-inside text-sm text-slate-200 space-y-1">
              <li v-for="choice in character.classInputs" :key="choice">{{ choice }}</li>
            </ul>
          </div>

          <div class="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
            <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Spells</div>
            <div v-if="character.spells.length" class="text-sm text-slate-200 space-y-1">
              <div v-for="spell in character.spells" :key="spell">- {{ spell }}</div>
            </div>
            <div v-else class="text-sm text-slate-500">None</div>
          </div>

          <div class="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
            <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Background (Origin)</div>
            <div class="text-lg font-semibold text-slate-100">{{ character.background }}</div>
            <div class="text-sm text-slate-300 mt-1">
              Bonuses: +2 {{ character.backgroundBoosts.plus2 }}, +1 {{ character.backgroundBoosts.plus1 }}
            </div>
            <div class="text-sm text-slate-300 mt-1">Origin Feat: {{ character.originFeat }}</div>
            <div v-if="character.originFeatDetail" class="text-sm text-slate-400 mt-1">
              {{ character.originFeatDetail }}
            </div>
          </div>

          <div class="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
            <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Species (Origin)</div>
            <div class="text-lg font-semibold text-slate-100">{{ character.species }}</div>
            <div class="text-sm text-slate-300 mt-1">Ancestry: {{ character.ancestry || 'None' }}</div>
            <div class="text-sm text-slate-300 mt-1">Languages: {{ listText(character.languages) }}</div>
          </div>

          <div class="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
            <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-3">Ability Scores</div>
            <div class="grid grid-cols-3 gap-3 text-center">
              <div v-for="([key, score]) in abilityEntries" :key="key" class="bg-slate-900/50 rounded-lg p-2 border border-slate-700/50">
                <div class="text-[10px] text-slate-500 uppercase tracking-widest">{{ key }}</div>
                <div class="text-lg font-bold text-slate-100">{{ score }}</div>
                <div class="text-xs text-emerald-300">
                  {{ character.modifiers[key] >= 0 ? '+' : '' }}{{ character.modifiers[key] }}
                </div>
              </div>
            </div>
          </div>

        </div>
        <div v-else class="text-center text-slate-500">Generate a character to view details.</div>
      </div>
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
</style>
