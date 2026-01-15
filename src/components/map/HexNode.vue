<script setup lang="ts">
import { computed } from 'vue';
import type { DungeonNode } from '../../types';
import { getNodeColor, getNodeIcon, getNodeClass } from '../../utils/nodeStyles';

const HEX_SIZE = 40;

interface Props {
  node: DungeonNode;
  isSelected: boolean;
  revealAll: boolean;
}

defineProps<Props>();
const emit = defineEmits<{ 
  click: [node: DungeonNode];
  enterEncounter: [node: DungeonNode];
}>();

const hexPath = computed(() => {
  const size = HEX_SIZE;
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i;
    const angle_rad = Math.PI / 180 * angle_deg;
    points.push(`${size * Math.cos(angle_rad)},${size * Math.sin(angle_rad)}`);
  }
  return points.join(' ');
});
</script>

<template>
  <g 
    :transform="`translate(${node.x}, ${node.y})`"
    class="group cursor-pointer"
    @click="emit('click', node)"
  >
    <!-- Selection Highlight -->
    <circle 
      v-if="isSelected"
      r="38" 
      fill="none"
      stroke="#fbbf24"
      stroke-width="3"
      stroke-dasharray="4 4"
      filter="url(#strong-glow)"
    >
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="10s" repeatCount="indefinite" />
    </circle>

    <!-- Glow Ring -->
    <circle 
      v-if="node.status === 'available'"
      r="32" 
      class="transition-opacity duration-300 opacity-40 group-hover:opacity-100"
      :fill="getNodeColor(node.type)"
      filter="url(#glow)"
    />
    
    <!-- Main Hex Shape -->
    <polygon 
      :points="hexPath" 
      :class="getNodeClass(node)"
      :fill="(revealAll || node.revealed || node.status === 'visited' || node.status === 'current') ? getNodeColor(node.type) : (isSelected ? '#1e293b' : undefined)"
      class="transition-all duration-200 group-hover:brightness-125 group-active:scale-90"
      :stroke="isSelected ? '#fbbf24' : (node.status === 'available' ? '#ffffff' : '#475569')"
      :stroke-width="isSelected ? 3 : 1.5"
    />
    
    <text 
      v-if="(revealAll || node.revealed || node.status === 'visited' || node.status === 'current') && node.type !== 'rest'"
      y="10" 
      text-anchor="middle" 
      class="text-[24px] pointer-events-none select-none font-bold filter drop-shadow-md transition-transform duration-200 group-hover:-translate-y-1 fill-white"
    >
      {{ getNodeIcon(node.type) }}
    </text>

    <!-- Custom Campfire Icon for Rest -->
    <g v-else-if="revealAll || node.revealed || node.status === 'visited' || node.status === 'current'" transform="translate(0, 0)" class="pointer-events-none">
      <!-- Logs -->
      <rect x="-18" y="8" width="36" height="6" rx="2" fill="#5d4037" transform="rotate(-15)" />
      <rect x="-18" y="8" width="36" height="6" rx="2" fill="#4e342e" transform="rotate(15)" />
      <rect x="-15" y="4" width="30" height="6" rx="2" fill="#3e2723" />
      <!-- Flames -->
      <path d="M -10 4 Q -15 -10 0 -25 Q 15 -10 10 4 Z" fill="#ef4444">
        <animate attributeName="d" values="M -10 4 Q -15 -10 0 -25 Q 15 -10 10 4 Z; M -10 4 Q -12 -15 0 -28 Q 12 -15 10 4 Z; M -10 4 Q -15 -10 0 -25 Q 15 -10 10 4 Z" dur="0.8s" repeatCount="indefinite" />
      </path>
      <path d="M -6 4 Q -10 -5 0 -15 Q 10 -5 6 4 Z" fill="#f59e0b">
        <animate attributeName="d" values="M -6 4 Q -10 -5 0 -15 Q 10 -5 6 4 Z; M -6 4 Q -8 -8 0 -18 Q 8 -8 6 4 Z; M -6 4 Q -10 -5 0 -15 Q 10 -5 6 4 Z" dur="0.6s" repeatCount="indefinite" />
      </path>
    </g>
    
    <text 
      v-else
      y="10" 
      text-anchor="middle" 
      class="text-[24px] pointer-events-none select-none fill-slate-700 font-bold"
    >
      ?
    </text>

  
  </g>
</template>
