<script setup lang="ts">
import { computed, ref } from 'vue';

interface HexProps {
  width?: number;
  height?: number;
  hexSize?: number;
}

const props = withDefaults(defineProps<HexProps>(), {
  width: 800,
  height: 600,
  hexSize: 30,
});

// Hex logic (Flat-topped)
const HEX_WIDTH = Math.sqrt(3) * props.hexSize;
const VERT_DIST = 3/2 * props.hexSize;
const HORIZ_DIST = Math.sqrt(3) * props.hexSize;

interface Hex {
  q: number;
  r: number;
  x: number;
  y: number;
  id: string;
  visibility: 'visible' | 'visited' | 'hidden';
}

// State
const grid = ref<Hex[]>([]);
const playerPos = ref<{q: number, r: number} | null>(null);

// Initialize Grid
const initGrid = () => {
  const hexes: Hex[] = [];
  const cols = Math.floor(2000 / HORIZ_DIST);
  const rows = Math.floor(2000 / VERT_DIST);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const xOffset = (r % 2 === 1) ? HEX_WIDTH / 2 : 0;
      const x = c * HORIZ_DIST + xOffset + props.hexSize;
      const y = r * VERT_DIST + props.hexSize;
      
      hexes.push({ 
        q: c - Math.floor(r/2), 
        r, 
        x, 
        y, 
        id: `${c},${r}`,
        visibility: 'visible' 
      });
    }
  }
  grid.value = hexes;
  
  // Start at center by index to guarantee validity
  if (grid.value.length > 0) {
    const centerIndex = Math.floor(grid.value.length / 2);
    // Adjust slightly to ensure we aren't on an edge case if needed, but center index is fine
    const startHex = grid.value[centerIndex];
    
    playerPos.value = { q: startHex.q, r: startHex.r };
    updateVisibility(startHex);
    
    // Center view on start
    viewBox.value.x = startHex.x - props.width/2;
    viewBox.value.y = startHex.y - props.height/2;
  }
};

const getHexAt = (q: number, r: number) => {
  // Simple search, optimization: use map
  return grid.value.find(h => h.q === q && h.r === r);
};

const getNeighbors = (hex: Hex) => {
  const directions = [
    {q: 1, r: 0}, {q: 1, r: -1}, {q: 0, r: -1},
    {q: -1, r: 0}, {q: -1, r: 1}, {q: 0, r: 1}
  ];
  return directions.map(d => getHexAt(hex.q + d.q, hex.r + d.r)).filter(h => h !== undefined) as Hex[];
};

const updateVisibility = (center: Hex) => {
  // Mark all currently visible as visited
  grid.value.forEach(h => {
    if (h.visibility === 'visible') h.visibility = 'visited';
  });

  // Reveal center
  center.visibility = 'visible';

  // Reveal neighbors
  const neighbors = getNeighbors(center);
  neighbors.forEach(h => {
    if (h.visibility !== 'visible') h.visibility = 'visible'; // Or 'revealed' if distinct from player loc
  });
};



// Hexagon SVG path points
const points = computed(() => {
  const size = props.hexSize - 2; 
  return [
    `${-size * Math.sqrt(3)/2},${-size/2}`,
    `0,${-size}`,
    `${size * Math.sqrt(3)/2},${-size/2}`,
    `${size * Math.sqrt(3)/2},${size/2}`,
    `0,${size}`,
    `${-size * Math.sqrt(3)/2},${size/2}`,
  ].join(' ');
});

const handleClick = (hex: Hex) => {
  // Movement logic: simple teleport for now
  
  playerPos.value = { q: hex.q, r: hex.r };
  updateVisibility(hex);
};

// Zoom and Pan State
const viewBox = ref({ x: 0, y: 0, w: props.width, h: props.height });
const isDragging = ref(false);
const lastMousePos = ref({ x: 0, y: 0 });

const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
  const zoomFactor = 1.1;
  const direction = e.deltaY > 0 ? 1 : -1;
  
  const w = viewBox.value.w;
  const h = viewBox.value.h;
  let newW = w;
  let newH = h;

  if (direction > 0) {
    newW = w * zoomFactor;
    newH = h * zoomFactor;
  } else {
    newW = w / zoomFactor;
    newH = h / zoomFactor;
  }

  viewBox.value.x -= (newW - w) / 2;
  viewBox.value.y -= (newH - h) / 2;
  viewBox.value.w = newW;
  viewBox.value.h = newH;
};

const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true;
  lastMousePos.value = { x: e.clientX, y: e.clientY };
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  const dx = e.clientX - lastMousePos.value.x;
  const dy = e.clientY - lastMousePos.value.y;
  
  const scaleX = viewBox.value.w / props.width;
  const scaleY = viewBox.value.h / props.height;

  viewBox.value.x -= dx * scaleX;
  viewBox.value.y -= dy * scaleY;

  lastMousePos.value = { x: e.clientX, y: e.clientY };
};

const handleMouseUp = () => {
  isDragging.value = false;
};

const handleMouseLeave = () => {
  isDragging.value = false;
};

const getHexClass = (hex: Hex) => {
  const base = "transition-colors duration-300 stroke-slate-600 cursor-pointer ";
  if (playerPos.value?.q === hex.q && playerPos.value?.r === hex.r) {
    return base + "fill-amber-500 stroke-amber-300"; // Player
  }
  if (hex.visibility === 'visible') {
    return base + "fill-slate-700 hover:fill-slate-600 hover:stroke-emerald-400";
  }
  if (hex.visibility === 'visited') {
    return base + "fill-slate-800/80 stroke-slate-700";
  }
  // Hidden but slightly visible for debugging/context
  return base + "fill-slate-900 stroke-slate-800"; 
};
initGrid();
</script>

<template>
  <div 
    class="hex-grid-container bg-black border border-slate-700 rounded-lg overflow-hidden shadow-2xl relative select-none"
    @wheel="handleWheel"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
  >
    <svg 
      :width="width" 
      :height="height" 
      :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`"
      class="block bg-black"
    >
      <pattern id="grid-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      </pattern>
      
      <g v-for="hex in grid" :key="hex.id" :transform="`translate(${hex.x}, ${hex.y})`">
        <polygon 
          :points="points" 
          :class="getHexClass(hex)"
          @click.stop="handleClick(hex)"
        />
        <text 
          v-if="hex.visibility !== 'hidden'"
          x="0" 
          y="0" 
          text-anchor="middle" 
          alignment-baseline="middle" 
          class="text-[1px] fill-slate-500 pointer-events-none"
          :style="{ fontSize: `${hexSize/2}px` }"
        >
          {{ hex.q }},{{ hex.r }}
        </text>
      </g>
    </svg>
    
    <div class="absolute bottom-4 right-4 bg-slate-800 p-2 rounded text-xs text-slate-400 opacity-75 pointer-events-none">
      Zoom: {{ Math.round(props.width / viewBox.w * 100) }}% | Pos: {{ Math.round(viewBox.x) }}, {{ Math.round(viewBox.y) }}
    </div>
  </div>
</template>

<style scoped>
.hex-grid-container {
  cursor: grab;
}
.hex-grid-container:active {
  cursor: grabbing;
}
</style>
