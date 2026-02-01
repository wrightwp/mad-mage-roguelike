<script setup lang="ts">
import { ref, computed } from 'vue';
import { EncounterType, EncounterDifficulty, EncounterAttitude } from '../types';
import type { EncounterData, MonsterData } from '../types';
import { useEncounterFeedbackStore } from '../stores/useEncounterFeedbackStore';
import { monsterLibrary } from '../data/monsterLibrary';

defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created', encounter: EncounterData): void;
}>();

const feedbackStore = useEncounterFeedbackStore();
const monsterSearchQuery = ref('');

const newEncounter = ref<EncounterData>({
  id: '',
  name: '',
  type: EncounterType.Combat,
  level: 1,
  difficulty: EncounterDifficulty.Moderate,
  roomDescription: '',
  dmDescription: [],
  size: 1,
  monsters: [],
  xpBudget: 0,
  attitude: EncounterAttitude.Hostile,
  winConditions: [],
  scalingMechanics: []
});

const monsterSearchResults = computed(() => {
  if (!monsterSearchQuery.value || monsterSearchQuery.value.length < 2) return [];
  return monsterLibrary.searchMonsters(monsterSearchQuery.value).slice(0, 50); // Limit results
});

const totalMonsterXp = computed(() => {
    if (!(newEncounter.value as any).monsters) return 0;
    return (newEncounter.value as any).monsters.reduce((sum: number, m: MonsterData) => sum + (m.exp * (m.count || 1)), 0);
});

const remainingXp = computed(() => {
    const budget = (newEncounter.value as any).xpBudget || 0;
    return budget - totalMonsterXp.value;
});

// XP Thresholds per character level (DMG 2014/2024 standard)
// XP Thresholds per character level (D&D 2024 Rules)
const XP_THRESHOLDS: Record<number, Record<string, number>> = {
  1: { Low: 50, Moderate: 75, High: 100 },
  2: { Low: 100, Moderate: 150, High: 200 },
  3: { Low: 150, Moderate: 225, High: 400 },
  4: { Low: 250, Moderate: 375, High: 500 },
  5: { Low: 500, Moderate: 750, High: 1100 },
  6: { Low: 600, Moderate: 1000, High: 1400 },
  7: { Low: 750, Moderate: 1300, High: 1700 },
  8: { Low: 1000, Moderate: 1700, High: 2100 },
  9: { Low: 1300, Moderate: 2000, High: 2600 },
  10: { Low: 1600, Moderate: 2300, High: 3100 },
  11: { Low: 1900, Moderate: 2900, High: 4100 },
  12: { Low: 2200, Moderate: 3700, High: 4700 },
  13: { Low: 2600, Moderate: 4200, High: 5400 },
  14: { Low: 2900, Moderate: 4900, High: 6200 },
  15: { Low: 3300, Moderate: 5400, High: 7800 },
  16: { Low: 3800, Moderate: 6100, High: 9800 },
  17: { Low: 4500, Moderate: 7200, High: 11700 },
  18: { Low: 5000, Moderate: 8700, High: 14200 },
  19: { Low: 5500, Moderate: 10700, High: 17200 },
  20: { Low: 6400, Moderate: 13200, High: 22000 },
};

import { watch } from 'vue';

// Auto-calculate XP budget
watch(
  [() => newEncounter.value.level, () => newEncounter.value.difficulty],
  ([newLevel, newDifficulty]) => {
    // If user hasn't heavily modified it manually? 
    // Actually, prompt says "Automatically adjust", implies override.
    // We assume 4 party members.
    
    // Level clamp
    const level = Math.max(1, Math.min(20, newLevel || 1));
    const thresholds = XP_THRESHOLDS[level];
    
    if (thresholds) {
      let baseOneCharXP = 0;
      
      switch(newDifficulty) {
          case EncounterDifficulty.Low: 
              baseOneCharXP = thresholds.Low; 
              break;
          case EncounterDifficulty.Moderate: 
              baseOneCharXP = thresholds.Moderate; 
              break;
          case EncounterDifficulty.High: 
              baseOneCharXP = thresholds.High; 
              break;
          default:
              baseOneCharXP = thresholds.Moderate;
      }
      
      (newEncounter.value as any).xpBudget = baseOneCharXP * 4;
    }
  },
  { immediate: true }
);

const addMonster = (monster: MonsterData) => {
  if (!(newEncounter.value as any).monsters) {
    (newEncounter.value as any).monsters = [];
  }
  // Clone to avoid reference issues if we modify it later (though MonsterData is mostly static)
  const monsterClone = JSON.parse(JSON.stringify(monster));
  monsterClone.count = 1;
  (newEncounter.value as any).monsters.push(monsterClone);
  monsterSearchQuery.value = '';
};

const removeMonster = (index: number) => {
  (newEncounter.value as any).monsters.splice(index, 1);
};

const addScalingMechanic = () => {
    if (!newEncounter.value.scalingMechanics) {
        newEncounter.value.scalingMechanics = [];
    }
    const id = `sm-${newEncounter.value.scalingMechanics.length}`;
    newEncounter.value.scalingMechanics.push({
        type: 'trap',
        id,
        subType: '',
        dc: 15,
        damage: ''
    });
};

const resetForm = () => {
    newEncounter.value = {
        id: '',
        name: '',
        type: EncounterType.Combat,
        level: 1,
        difficulty: EncounterDifficulty.Moderate,
        roomDescription: '',
        dmDescription: [], // Initialize as empty array
        size: 1,
        monsters: [],
        xpBudget: 0,
        attitude: EncounterAttitude.Hostile,
        winConditions: [],
        scalingMechanics: []
    } as EncounterData; // Cast to force fit
    monsterSearchQuery.value = '';
};

const dmDescriptionText = ref(''); // Intermediate state for textarea

const handleCreate = () => {
  const timestamp = Date.now();
  const id = `custom-${timestamp}`;
  
  // Parse DM description from text block to array if needed, or just wrap
  const descriptionArray = dmDescriptionText.value.split('\n').filter(line => line.trim().length > 0);

  const encounterBase = {
    ...newEncounter.value,
    id: id,
    name: newEncounter.value.name || `Custom Encounter ${timestamp.toString().slice(-4)}`,
    dmDescription: descriptionArray.length > 0 ? descriptionArray : ['Custom encounter created via app.'],
    winConditions: [...(newEncounter.value.winConditions || [])],
    scalingMechanics: [...(newEncounter.value.scalingMechanics || [])],
  };

  // Add monsters only if accessible (Combat/Boss)
  const finalEncounter = {
    ...encounterBase,
    monsters: [...((newEncounter.value as any).monsters || [])]
  } as EncounterData;

  // Save to feedback store immediately so it persists and flows into the app logic
  feedbackStore.saveEntry({
    key: id,
    encounterName: finalEncounter.name,
    encounterType: finalEncounter.type,
    floor: finalEncounter.level,
    original: finalEncounter,
    edited: finalEncounter,
    editedAt: new Date().toISOString()
  });

  emit('created', finalEncounter);
  emit('close');
  resetForm();
  dmDescriptionText.value = '';
};

const copiedId = ref<string | null>(null);

const copyToken = (id: string) => {
  const token = `{{${id}}}`;
  navigator.clipboard.writeText(token);
  copiedId.value = id;
  setTimeout(() => {
    copiedId.value = null;
  }, 1500);
};

const addWinCondition = () => {
  if (!newEncounter.value.winConditions) {
    newEncounter.value.winConditions = [];
  }
  newEncounter.value.winConditions.push({
    condition: '',
    reward: '',
    xpReward: 0,
    goldReward: 0
  });
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" @click="emit('close')"></div>

    <!-- Modal Content -->
    <div class="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 rounded-t-xl">
        <h2 class="text-lg font-bold text-amber-400 uppercase tracking-widest">Create New Encounter</h2>
        <button 
          @click="emit('close')"
          class="text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <!-- Scrollable Body -->
      <div class="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-5">
        
        <!-- Basic Info Grid -->
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Encounter Name</label>
            <input
              v-model="newEncounter.name"
              type="text"
              placeholder="e.g. The Hidden Vault"
              class="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
              autofocus
            />
          </div>

          <div>
            <label class="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Type</label>
            <select
              v-model="newEncounter.type"
              class="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
            >
              <option v-for="type in Object.values(EncounterType)" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Difficulty</label>
            <select
              v-model="newEncounter.difficulty"
              class="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
            >
              <option v-for="difficulty in Object.values(EncounterDifficulty)" :key="difficulty" :value="difficulty">
                {{ difficulty }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Level</label>
            <input
              v-model.number="newEncounter.level"
              type="number"
              min="1"
              max="20"
              class="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
            />
          </div>

          <div>
             <!-- XP Budget is loose on the type, explicitly casting for simplicity in this general form -->
            <label class="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">XP Budget</label>
            <input
              v-model.number="(newEncounter as any).xpBudget"
              type="number"
              min="0"
              step="10"
              class="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
            />
            <div class="flex justify-end mt-1">
                <span :class="{'text-emerald-400': remainingXp >= 0, 'text-red-400': remainingXp < 0}" class="text-[10px] font-mono">
                    {{ remainingXp >= 0 ? 'Remaining' : 'Over' }}: {{ Math.abs(remainingXp) }} XP
                </span>
            </div>
          </div>
        </div>

        <!-- Descriptions -->
        <div>
          <label class="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Room Description (Player Visible)</label>
          <textarea
            v-model="newEncounter.roomDescription"
            rows="3"
            placeholder="What the players see when they enter..."
            class="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
          ></textarea>
        </div>

        <div>
           <label class="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">DM Description (Secrets/Mechanics)</label>
           <textarea
             v-model="dmDescriptionText"
             rows="3"
             placeholder="Traps, hidden enemies, DC checks..."
             class="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
           ></textarea>
           <p class="text-[10px] text-slate-500 mt-1">Each line will be treated as a bullet point.</p>
        </div>

        <!-- Monsters (Combat/Boss only) -->
        <div v-if="newEncounter.type === EncounterType.Combat || newEncounter.type === EncounterType.Boss" class="space-y-2 pt-2 border-t border-slate-800">
           <label class="block text-[10px] text-slate-500 uppercase tracking-wider">Monsters</label>
           
           <!-- Search -->
           <div class="relative">
              <input 
                 v-model="monsterSearchQuery"
                 type="text"
                 placeholder="Search monsters..."
                 class="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
              />
              <!-- Results Dropdown -->
              <div v-if="monsterSearchQuery && monsterSearchResults.length > 0" class="absolute z-10 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                 <button
                    v-for="monster in monsterSearchResults"
                    :key="monster.id"
                    @click="addMonster(monster)"
                    class="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex justify-between items-center border-b border-slate-800 last:border-0"
                 >
                    <div class="flex flex-col">
                        <span>{{ monster.name }}</span>
                        <span class="text-[10px] text-slate-500" v-if="monster.thematicType">{{ monster.thematicType }}</span>
                    </div>
                    <div class="flex flex-col items-end">
                       <span class="text-[10px] text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded mb-0.5">CR {{ monster.cr }}</span>
                       <span class="text-[9px] text-slate-600">{{ monster.exp }} XP</span>
                    </div>
                 </button>
              </div>
           </div>

           <!-- Selected Monsters List -->
           <div v-if="(newEncounter as any).monsters && (newEncounter as any).monsters.length > 0" class="space-y-1.5 mt-2">
              <div 
                 v-for="(monster, index) in (newEncounter as any).monsters" 
                 :key="index"
                 class="flex items-center justify-between bg-slate-950/50 border border-slate-700/50 rounded px-3 py-1.5"
              >
                 <div class="flex items-center gap-3 flex-1">
                    <input 
                        v-model.number="monster.count" 
                        type="number" 
                        min="1" 
                        class="w-12 bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-xs text-center text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                    <div class="flex flex-col">
                        <span class="text-xs text-slate-200 font-medium">{{ monster.name }}</span>
                        <div class="flex items-center gap-2">
                            <span v-if="monster.thematicType" class="text-[10px] text-slate-500 italic">{{ monster.thematicType }}</span>
                            <span class="text-[10px] text-slate-500">CR {{ monster.cr }} ({{ monster.exp * Number(monster.count || 1) }} XP)</span>
                        </div>
                    </div>
                 </div>
                 <button 
                    @click="removeMonster(index)"
                    class="text-slate-600 hover:text-red-400 transition-colors ml-2"
                    title="Remove Monster"
                 >
                    ✕
                 </button>
              </div>
           </div>
           <div v-else class="text-xs text-slate-600 italic py-2 text-center border border-dashed border-slate-800 rounded">
              No monsters added yet.
           </div>
        </div>

        <!-- Scaling Mechanics -->
        <div class="space-y-2 pt-2 border-t border-slate-800">
           <div class="flex items-center justify-between">
              <label class="block text-[10px] text-slate-500 uppercase tracking-wider">Scaling Mechanics</label>
              <button
                 @click="addScalingMechanic"
                 class="text-[10px] text-amber-500 hover:text-amber-400 font-bold uppercase tracking-wide flex items-center gap-1"
              >
                 <span>+</span> Add
              </button>
           </div>
           
           <div v-if="newEncounter.scalingMechanics && newEncounter.scalingMechanics.length > 0" class="space-y-2">
              <div 
                 v-for="(mechanic, index) in newEncounter.scalingMechanics" 
                 :key="index"
                 class="bg-slate-950/50 border border-slate-700/50 rounded px-2 py-2 relative group"
              >
                 <div class="flex flex-col gap-1.5">
                    <div class="flex items-center gap-2">
                       <select v-model="mechanic.type" class="w-24 bg-transparent border-b border-slate-700/50 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 pb-0.5 uppercase font-bold tracking-wider">
                          <option value="trap">Trap</option>
                          <option value="hazard">Hazard</option>
                          <option value="skill">Skill</option>
                          <option value="puzzle">Puzzle</option>
                          <option value="other">Other</option>
                       </select>
                       <input v-model="mechanic.subType" type="text" class="flex-1 bg-transparent border-b border-slate-700/50 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 pb-0.5" placeholder="Details (e.g. Dex Save)" />
                    </div>
                    <div class="flex items-center gap-2">
                       <div 
                          @click="copyToken(mechanic.id)"
                          class="text-[10px] text-slate-500 font-mono select-none cursor-pointer hover:text-amber-400 transition-colors"
                          title="Click to copy token"
                       >
                          {{ mechanic.id }}
                          <span v-if="copiedId === mechanic.id" class="text-emerald-400 font-bold ml-1">Copied!</span>
                       </div>
                       <div class="flex items-center gap-1 w-16">
                          <span class="text-[9px] text-slate-500 select-none">DC</span>
                          <input v-model.number="mechanic.dc" type="number" class="w-full bg-slate-800/50 border-none rounded px-1 py-0.5 text-[10px] text-right text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500/20" placeholder="-" />
                       </div>
                       <div class="flex items-center gap-1 flex-1">
                          <span class="text-[9px] text-slate-500 select-none">DMG</span>
                          <input v-model="mechanic.damage" type="text" class="w-full bg-slate-800/50 border-none rounded px-1 py-0.5 text-[10px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500/20" placeholder="e.g. 2d6" />
                       </div>
                       <button @click="newEncounter.scalingMechanics?.splice(index, 1)" class="text-slate-600 hover:text-red-400 transition-colors px-1">✕</button>
                    </div>
                 </div>
              </div>
           </div>
           
           <div v-else class="text-xs text-slate-600 italic py-2 text-center border border-dashed border-slate-800 rounded">
              No scaling mechanics added.
           </div>
        </div>

        <!-- Win Conditions -->
         <div class="space-y-2 pt-2 border-t border-slate-800">
            <div class="flex items-center justify-between">
                <label class="block text-[10px] text-slate-500 uppercase tracking-wider">Win Conditions</label>
                <button
                    @click="addWinCondition"
                    class="text-[10px] text-amber-500 hover:text-amber-400 font-bold uppercase tracking-wide flex items-center gap-1"
                >
                    <span>+</span> Add
                </button>
            </div>
            
            <div v-if="newEncounter.winConditions && newEncounter.winConditions.length > 0" class="space-y-2">
            <div 
                v-for="(wc, index) in newEncounter.winConditions" 
                :key="index"
                class="bg-slate-950/50 border border-slate-700/50 rounded px-3 py-2 relative group"
            >
                <!-- Inputs Grid -->
                <div class="flex flex-col gap-2">
                <!-- Row 1: Condition -->
                <input
                    v-model="wc.condition"
                    type="text"
                    class="w-full bg-transparent border-b border-slate-700/50 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 pb-1"
                    placeholder="Condition (e.g. Defeat the boss)"
                />
                
                <!-- Row 2: Rewards & Controls -->
                <div class="flex items-center gap-3">
                    <input
                    v-model="wc.reward"
                    type="text"
                    class="flex-1 bg-transparent border-b border-slate-700/50 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 pb-1"
                    placeholder="Narrative Reward"
                    />
                    
                    <div class="flex items-center gap-1 w-20">
                    <span class="text-[9px] text-slate-500 select-none">XP</span>
                    <input
                        v-model.number="wc.xpReward"
                        type="number"
                        class="w-full bg-slate-800/50 border-none rounded px-2 py-1 text-[10px] text-right text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
                        placeholder="0"
                    />
                    </div>

                    <div class="flex items-center gap-1 w-20">
                    <span class="text-[9px] text-slate-500 select-none">GP</span>
                    <input
                        v-model.number="wc.goldReward"
                        type="number"
                        class="w-full bg-slate-800/50 border-none rounded px-2 py-1 text-[10px] text-right text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
                        placeholder="0"
                    />
                    </div>

                    <button 
                    @click="newEncounter.winConditions?.splice(index, 1)"
                    class="text-slate-600 hover:text-red-400 transition-colors px-1 ml-1"
                    title="Remove Condition"
                    >
                    ✕
                    </button>
                </div>
                </div>
            </div>
            </div>
            
            <div v-else class="text-xs text-slate-600 italic py-2 text-center border border-dashed border-slate-800 rounded">
            No win conditions added yet.
            </div>
        </div>

        <div class="pt-2 border-t border-slate-800">
           <label class="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">AI Room Prompt</label>
           <textarea
             v-model="newEncounter.aiRoomPrompt"
             rows="2"
             placeholder="Prompt for generating the battle map..."
             class="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
           ></textarea>
        </div>

      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-slate-800 bg-slate-900/50 rounded-b-xl flex justify-end gap-3">
        <button 
          @click="emit('close')"
          class="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
        >
          Cancel
        </button>
        <button 
          @click="handleCreate"
          class="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-amber-900/20 transition-all transform active:scale-95"
        >
          Create Encounter
        </button>
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
