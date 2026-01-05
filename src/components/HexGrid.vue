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
  hexSize: 60,
});

// Hex logic (Flat-topped)
// Width = 2 * size
// Height = sqrt(3) * size
// Horiz spacing = 3/2 * size
// Vert spacing = sqrt(3) * size
const HEX_WIDTH = 2 * props.hexSize;
const HEX_HEIGHT = Math.sqrt(3) * props.hexSize;
const HORIZ_DIST = 3/2 * props.hexSize;
const VERT_DIST = Math.sqrt(3) * props.hexSize;

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
  const cols = 6;
  const rows = 25; // "Tall" map

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Offset for odd columns in "Pointy" or odd rows in "Flat"?
      // Flat-Topped usually uses "Q-offset" (columns).
      // Let's use standard Odd-Q vertical layout.
      // x = c * HORIZ_DIST
      // y = r * VERT_DIST + (c%2)*VERT_DIST/2
      
      const x = c * HORIZ_DIST + props.hexSize;
      const yOffset = (c % 2 === 1) ? HEX_HEIGHT / 2 : 0;
      const y = r * VERT_DIST + yOffset + props.hexSize;
      
      hexes.push({ 
        q: c, 
        r: r - (c - (c&1)) / 2, // axial conversion can be complex, sticking to grid coords for 'north' check might be easier?
        // Let's store grid coords too for easy "North" logic
        x, 
        y, 
        id: `${c},${r}`,
        visibility: 'hidden' // Default hidden
      });
    }
  }
  grid.value = hexes;
  
  // Start at Bottom Center
  if (grid.value.length > 0) {
    // Filter for bottom-most row
    // Just pick roughly middle column of last row
    const startHex = grid.value.find(h => h.id === `2,${rows-1}`) || grid.value[grid.value.length - 1];

    if (startHex) {
      playerPos.value = { q: startHex.q, r: startHex.r }; // storing axial, though we might rely on ID/obj lookup
      revealFrom(startHex);
      
      // Center view on start
      viewBox.value.x = startHex.x - props.width/2;
      viewBox.value.y = startHex.y - props.height/2;
    }
  }
};

const revealFrom = (center: Hex) => {
   // Mark center as visited (or 'current')
   // But user wants "Choose room", so maybe current is "Visited"
   center.visibility = 'visited';
   
   // Logic: Reveal 3 rooms to the "North".
   // "North" in this layout (Top-left 0,0) is LOWER 'y'.
   // Neighbors in Odd-Q specific layout?
   
   // Let's strictly use geometry: Find neighbors with y < center.y
   // Standard neighbor distance is roughly HEX_HEIGHT
   
   // Find all hexes within neighbor distance
   const neighbors = grid.value.filter(h => {
     const dx = h.x - center.x;
     const dy = h.y - center.y;
     const dist = Math.sqrt(dx*dx + dy*dy);
     return dist > 1 && dist < HEX_WIDTH * 1.2; // approx check
   });
   
   // Filter for "North" (Lower Y)
   // We want exactly the 3 "above"
   const northNeighbors = neighbors.filter(h => h.y < center.y - 1); // -1 for float safety
   
   northNeighbors.forEach(h => {
      // If NOT visited, make visible (choice)
      if (h.visibility === 'hidden') {
        h.visibility = 'visible';
      }
   });
};

// Hexagon SVG path points (Flat Topped)
const points = computed(() => {
  const size = props.hexSize - 2; 
  // Flat topped: Points at 0, 60, 120... offset by 0? 
  // Angles: 0, 60, 120, 180, 240, 300
  // 0 deg is RIGHT. 
  // Point 1: (size, 0)
  // Point 2: (size/2, sqrt(3)/2 * size) -> Bottom Right? No, y goes down in SVG usually?
  // Let's generate standard flat top
  const corners = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i;
    const angle_rad = Math.PI / 180 * angle_deg;
    corners.push(`${size * Math.cos(angle_rad)},${size * Math.sin(angle_rad)}`);
  }
  return corners.join(' ');
});

const handleClick = (hex: Hex) => {
  // Only allow move to visible (candidate) hexes
  // Or visited? No, usually cannot backtrack in this style?
  // Let's assume strict forward progression for now.
  if (hex.visibility !== 'visible') return;

  playerPos.value = { q: hex.q, r: hex.r };
  
  // Previous choices might disappear? 
  // User said "Selecting a hexagon to choose room...". 
  // Implicitly, we commit to that room.
  
  // Mark old options as hidden? Or just leave them?
  // "Fog of War" usually implies visited stays visible.
  // But unchosen paths? Let's leave them visible but non-interactive?
  // For now: Just reveal new stuff.
  
  revealFrom(hex);
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
  
  // Player Position override
  if (playerPos.value?.q === hex.q && playerPos.value?.r === hex.r) {
     // Even if visited, if player is there, show Player Highlight
     return base + "fill-blue-500 stroke-blue-300"; 
  }

  if (hex.visibility === 'visible') {
    // These are the "Choices"
    return base + "fill-slate-700 hover:fill-amber-900 hover:stroke-amber-500";
  }
  
  if (hex.visibility === 'visited') {
    // Path traveled
    return base + "fill-slate-800/50 stroke-slate-700";
  }
  
  // Hidden
  return base + "fill-slate-950 stroke-slate-900 opacity-20 pointer-events-none"; 
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
