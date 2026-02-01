<script setup lang="ts">
import type { TreasureEncounterData } from '../../types/EncounterData';

const props = defineProps<{
  encounter: TreasureEncounterData;
}>();

const getMechanic = (id: string) => {
  return props.encounter.scalingMechanics?.find((m: any) => m.id === id);
};

const parseDescription = (text: string) => {
  const parts: { type: 'text' | 'mechanic', content: string }[] = [];
  const regex = /{{(.*?)}}/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    parts.push({ type: 'mechanic', content: match[1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex) });
  }
  return parts;
};
</script>

<template>
  <div class="bg-amber-900/10 rounded-xl p-4 border border-amber-900/30">
    <div class="flex items-center justify-between mb-3">
        <div class="text-[10px] text-amber-400 uppercase tracking-widest font-bold">Treasure Encounter</div>
        <div v-if="encounter.goldValue" class="text-xs font-bold text-amber-300 bg-amber-900/40 px-2 py-0.5 rounded border border-amber-500/30">
            {{ encounter.goldValue }} GP
        </div>
    </div>
    
    <div v-if="encounter.items && encounter.items.length" class="mb-3">
      <strong class="text-amber-300 text-sm block mb-2">Loot:</strong>
      <ul class="list-disc list-inside text-xs text-slate-300 space-y-1">
        <li v-for="item in encounter.items" :key="item">{{ item }}</li>
      </ul>
    </div>
    
    <div v-if="encounter.hasTrap" class="mt-3 bg-red-900/20 p-2 rounded border border-red-900/30">
      <strong class="text-red-400 text-xs block mb-1">⚠️ Trap Detected:</strong>
      <p class="text-xs text-red-200 indent-2">
        <template v-for="(part, pIdx) in parseDescription(encounter.trapDescription || 'Unknown Trap')" :key="pIdx">
            <span v-if="part.type === 'text'">{{ part.content }}</span>
            <span v-else-if="getMechanic(part.content)" 
            class="inline-flex items-center gap-1 align-middle px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mx-1 select-none cursor-help"
            :class="{
                'bg-red-900/80 text-red-200 border border-red-800/50': getMechanic(part.content)?.type === 'trap',
                'bg-blue-900/80 text-blue-200 border border-blue-800/50': getMechanic(part.content)?.type === 'skill',
                'bg-amber-900/80 text-amber-200 border border-amber-800/50': getMechanic(part.content)?.type === 'puzzle',
                'bg-orange-900/80 text-orange-200 border border-orange-800/50': getMechanic(part.content)?.type === 'hazard',
            }"
            :title="getMechanic(part.content)?.subType"
            >
                {{ getMechanic(part.content)?.subType || getMechanic(part.content)?.type }} :
                <span v-if="getMechanic(part.content)?.dc" class="bg-black/30 px-1 rounded">DC {{ getMechanic(part.content)?.dc }}</span>
                <span v-if="getMechanic(part.content)?.damage" class="ml-0.5">{{ getMechanic(part.content)?.damage }}</span>
            </span>
            <span v-else class="text-red-500 text-xs">??</span>
        </template>
      </p>
    </div>



    <div v-if="encounter.isMimic" class="mt-3 bg-purple-900/20 p-2 rounded border border-purple-900/50 animate-pulse">
      <strong class="text-purple-400 text-xs block mb-1">👾 MIMIC ALERT:</strong>
      <p class="text-xs text-purple-200">The treasure is a monster!</p>
    </div>
    
    <div v-if="encounter.isLocked && !encounter.isMimic" class="mt-3 flex items-center gap-2 text-xs text-slate-300 bg-slate-900/40 p-2 rounded border border-slate-700/30">
      <span>🔒</span>
      <strong>Locked</strong>
      <span v-if="encounter.lockDC" class="text-slate-500">(DC {{ encounter.lockDC }})</span>
    </div>
  </div>
</template>
