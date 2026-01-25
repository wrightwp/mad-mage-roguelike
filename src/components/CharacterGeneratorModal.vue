<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { generateCharacter, type GeneratedCharacter, type AbilityScores, CLASS_NAMES } from '../utils/characterGenerator';

const props = defineProps<{
  show: boolean;
  level?: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const character = ref<GeneratedCharacter | null>(null);
const selectedLevel = ref(1);
const selectedClass = ref('Random');
const abilityOrder: (keyof AbilityScores)[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
const abilityEntries = computed(() => {
  if (!character.value) return [] as Array<[keyof AbilityScores, number]>;
  return abilityOrder.map((key) => [key, character.value!.abilityScores[key]] as [keyof AbilityScores, number]);
});

const buildCharacter = () => {
  const classChoice = selectedClass.value === 'Random' ? undefined : selectedClass.value;
  character.value = generateCharacter(selectedLevel.value, classChoice);
};

watch(
  () => props.show,
  (show) => {
    if (show) {
      selectedLevel.value = props.level ?? 1;
      buildCharacter();
    }
  }
);

const listText = (items: string[], fallback = 'None') => (items.length ? items.join(', ') : fallback);
const needsSpellcastingAbilityChoice = (feat: string) => feat.startsWith('Magic Initiate');
const lineageLabel = (species: string) => {
  if (species === 'Elf') return 'Elven Lineage';
  if (species === 'Tiefling') return 'Fiendish Legacy';
  return 'Ancestry';
};
const splitLabelValue = (text: string) => {
  const index = text.indexOf(':');
  if (index === -1) {
    return { label: text.trim(), value: '' };
  }
  return {
    label: text.slice(0, index).trim(),
    value: text.slice(index + 1).trim()
  };
};
const classInputParts = computed(() =>
  character.value ? character.value.classInputs.map((text) => ({ ...splitLabelValue(text), raw: text })) : []
);
const spellParts = computed(() =>
  character.value ? character.value.spells.map((text) => ({ ...splitLabelValue(text), raw: text })) : []
);
const originFeatDetailParts = computed(() => {
  if (!character.value?.originFeatDetail) return null;
  return splitLabelValue(character.value.originFeatDetail);
});

</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    @pointerdown.self="emit('close')"
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
          <select
            v-model.number="selectedLevel"
            class="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 uppercase tracking-wider"
          >
            <option v-for="level in 20" :key="level" :value="level">
              Level {{ level }}
            </option>
          </select>
          <select
            v-model="selectedClass"
            class="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 uppercase tracking-wider"
          >
            <option value="Random">Random Class</option>
            <option v-for="className in CLASS_NAMES" :key="className" :value="className">
              {{ className }}
            </option>
          </select>
          <div class="flex-1"></div>
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
            <div class="flex items-center justify-between text-lg font-semibold text-slate-100">
              <div>
                {{ character.className }}
                <span v-if="character.subclass" class="text-slate-400 text-sm"> ({{ character.subclass }})</span>
              </div>
              <div class="text-sm text-slate-300">Level {{ character.level }}</div>
            </div>
            <div class="mt-3">
              <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Class Inputs</div>
              <ul class="list-disc list-inside text-sm text-slate-200 space-y-1">
                <li v-for="choice in classInputParts" :key="choice.raw">
                  <span class="font-semibold">{{ choice.label }}</span>
                  <span v-if="choice.value" class="font-normal">: {{ choice.value }}</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
            <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Background (Origin)</div>
            <div class="text-lg font-semibold text-slate-100">{{ character.background }}</div>
            <div class="text-sm text-slate-300 mt-1">
              <span class="font-semibold">Bonuses</span>
              <span class="font-normal">: +2 {{ character.backgroundBoosts.plus2 }}, +1 {{ character.backgroundBoosts.plus1 }}</span>
            </div>
            <div v-if="character.backgroundSkillProficiencies.length" class="text-sm text-slate-300 mt-1">
              <span class="font-semibold">Skill Proficiency</span>
              <span class="font-normal">: {{ listText(character.backgroundSkillProficiencies) }}</span>
            </div>
            <div class="text-sm text-slate-300 mt-1">
              <span class="font-semibold">Origin Feat</span>
              <span class="font-normal">: {{ character.originFeat }}</span>
            </div>
            <div
              v-if="needsSpellcastingAbilityChoice(character.originFeat)"
              class="text-sm text-slate-300 mt-1"
            >
              <span class="font-semibold">Spellcasting Ability</span>
              <span class="font-normal">: Choose your Spellcasting Ability.</span>
            </div>
            <div v-if="originFeatDetailParts" class="text-sm text-slate-400 mt-1">
              <span class="font-semibold">{{ originFeatDetailParts.label }}</span>
              <span v-if="originFeatDetailParts.value" class="font-normal">: {{ originFeatDetailParts.value }}</span>
            </div>
          </div>

          <div class="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
            <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Species (Origin)</div>
            <div class="text-lg font-semibold text-slate-100">{{ character.species }}</div>
            <div class="text-sm text-slate-300 mt-1">
              <span class="font-semibold">{{ lineageLabel(character.species) }}</span>
              <span class="font-normal">: {{ character.ancestry || 'None' }}</span>
            </div>
            <div class="text-sm text-slate-300 mt-1">
              <span class="font-semibold">Languages</span>
              <span class="font-normal">: {{ listText(character.languages) }}</span>
            </div>
            <div v-if="character.speciesInputs.length" class="text-sm text-slate-300 mt-1">
              <span class="font-semibold">Choices</span>
              <span class="font-normal">: {{ character.speciesInputs.join('; ') }}</span>
            </div>
          </div>

          <div class="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
            <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-3">Ability Scores</div>
            <div class="grid grid-cols-6 gap-2 text-center">
              <div
                v-for="([key, score]) in abilityEntries"
                :key="key"
                class="bg-slate-900/50 rounded-lg p-2 border border-slate-700/50"
              >
                <div class="text-[10px] text-slate-500 uppercase tracking-widest">{{ key }}</div>
                <div class="text-lg font-bold text-slate-100">{{ score }}</div>
              </div>
            </div>
          </div>

          <div class="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
            <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Spells</div>
            <ul v-if="spellParts.length" class="list-disc list-inside text-sm text-slate-200 space-y-1">
              <li v-for="spell in spellParts" :key="spell.raw">
                <span class="font-semibold">{{ spell.label }}</span>
                <span v-if="spell.value" class="font-normal">: {{ spell.value }}</span>
              </li>
            </ul>
            <div v-else class="text-sm text-slate-500">None</div>
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
