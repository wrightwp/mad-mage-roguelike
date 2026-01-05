<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { generateDungeon } from '../logic/dungeonGen';
import type { DungeonMapData, DungeonNode } from '../types';

const MAP_WIDTH = 800;
const MAP_HEIGHT = 2000;
const HEX_SIZE = 40;

const mapData = ref<DungeonMapData | null>(null);
const viewBox = ref({ x: 0, y: 0, w: MAP_WIDTH, h: 800 }); // Partial view

// Settings
const floorCount = ref(15);
const showRestartConfirm = ref(false);
const revealAll = ref(false);

// Init
onMounted(() => {
  initMap();
});

const initMap = () => {
  mapData.value = generateDungeon(floorCount.value, MAP_WIDTH, MAP_HEIGHT);
  visitedPath.value = [];
  scrollToBottom();
};

const restartMap = () => {
  showRestartConfirm.value = false;
  initMap();
};

const scrollToBottom = () => {
    viewBox.value.y = MAP_HEIGHT - 800;
};

// Auto-scroll to current layer
const scrollToNode = (node: DungeonNode) => {
    // Target Y: Center the node vertically in the view
    // View Height is 800
    // Node Y is node.y
    // Target ViewY = node.y - 400
    const targetY = Math.max(0, Math.min(MAP_HEIGHT - 800, node.y - 400));
    
    // Simple smooth scroll (manual interpolation could be better but CSS transition on SVG viewBox is tricky, 
    // better to animate the value reactive-ly or use a library. For now, snap or simple lerp loop)
    
    // Let's use a simple detailed animation loop
    const startY = viewBox.value.y;
    const dist = targetY - startY;
    const duration = 500;
    const startTime = performance.now();
    
    const animate = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // cubic out
        
        viewBox.value.y = startY + dist * ease;
        
        if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
};

// Hexagon Path
const hexPath = computed(() => {
   const size = HEX_SIZE;
   // Pointy topped for standard directional flow? No, flat topped is fine.
   // Let's keep flat topped.
   const points = [];
   for (let i = 0; i < 6; i++) {
     const angle_deg = 60 * i;
     const angle_rad = Math.PI / 180 * angle_deg;
     points.push(`${size * Math.cos(angle_rad)},${size * Math.sin(angle_rad)}`);
   }
   return points.join(' ');
});

const handleNodeClick = (node: DungeonNode) => {
   if (node.status !== 'available') return;
   
   // Find the parent node we came from (must be visited and connected to this node)
   if (mapData.value) {
       const parentNode = mapData.value.nodes.find(n => 
           n.status === 'visited' && n.connections.includes(node.id)
       );
       
       if (parentNode) {
           // Record this edge in our path
           visitedPath.value.push({ from: parentNode.id, to: node.id });
       }
   }
   
   // Mark this node as 'visited'
   node.status = 'visited';
   
   // Mark connected NEXT nodes as 'available'
   if (mapData.value) {
       node.connections.forEach(targetId => {
          const target = mapData.value!.nodes.find(n => n.id === targetId);
          if (target && target.status === 'locked') {
             target.status = 'available';
          }
       });
       
       // Lock sibling 'available' nodes in THIS layer
       mapData.value.nodes.filter(n => n.layer === node.layer && n.id !== node.id && n.status === 'available').forEach(n => {
          n.status = 'locked'; 
       });
   }
   
   // Scroll Camera
   scrollToNode(node);
};

const TYPE_COLORS: Record<string, string> = {
    monster: '#ef4444', // Red-500
    elite: '#b91c1c',   // Red-700
    event: '#3b82f6',   // Blue-500
    rest: '#f97316',    // Orange-500
    shop: '#a855f7',    // Purple-500
    treasure: '#eab308', // Yellow-500
    puzzle: '#06b6d4',  // Cyan-500
    boss: '#991b1b',    // Red-800
    start: '#10b981'    // Emerald-500
};

const TYPE_ICONS: Record<string, string> = {
    monster: '⚔️',
    elite: '💀',
    event: '?',
    rest: '🔥', // Campfire
    shop: '💰',
    treasure: '💎',
    puzzle: '🧩',
    boss: '👹', // Boss
    start: '🏠'
};

const getNodeColor = (type: string) => TYPE_COLORS[type] || '#fff';
const getNodeIcon = (type: string) => TYPE_ICONS[type] || '';

const getNodeClass = (node: DungeonNode) => {
   const base = "transition-all duration-300 stroke-2 cursor-pointer ";
   
   if (node.status === 'visited') return base + "fill-slate-800 stroke-slate-600 opacity-50"; // Dim visited
   if (node.status === 'locked') return base + "fill-slate-900 stroke-slate-800 opacity-20 pointer-events-none";
   
   // Available: Glowing and Colored
   return base; // Color handled by style/fill binding
};

// Edges Logic - Track visited path explicitly
const visitedPath = ref<Array<{from: string, to: string}>>([]);

// Path taken (white dashed)
const activeEdges = computed(() => visitedPath.value);

// Available choices (amber glow) - edges from visited nodes to available nodes
const availableEdges = computed(() => {
    if (!mapData.value) return [];
    return mapData.value.edges.filter(e => {
        const fromNode = mapData.value?.nodes.find(n => n.id === e.from);
        const toNode = mapData.value?.nodes.find(n => n.id === e.to);
        return fromNode?.status === 'visited' && toNode?.status === 'available';
    });
});

const getEdgePath = (edge: {from: string, to: string}, seedOffset: number = 0) => {
    if (!mapData.value) return '';
    const n1 = mapData.value.nodes.find(n => n.id === edge.from);
    const n2 = mapData.value.nodes.find(n => n.id === edge.to);
    if (!n1 || !n2) return '';
    
    // Curvature logic
    const midX = (n1.x + n2.x) / 2;
    const midY = (n1.y + n2.y) / 2;
    
    const dx = n2.x - n1.x;
    const dy = n2.y - n1.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    // Normal vector
    const perpX = -dy / dist;
    const perpY = dx / dist;
    
    // Seed for "random" curve direction (Integers for determinism)
    const seed = Math.floor(n1.x * n1.y + n2.x * n2.y + seedOffset);
    const amplitude = 20 + (seed % 20); 
    const direction = seed % 2 === 0 ? 1 : -1;
    
    const cpX = midX + direction * amplitude * perpX; 
    const cpY = midY + direction * amplitude * perpY; 
    
    return `M ${n1.x} ${n1.y} Q ${cpX} ${cpY} ${n2.x} ${n2.y}`;
};

// Zoom and Pan Logic
const isDragging = ref(false);
const startPan = ref({ x: 0, y: 0 });

const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const direction = e.deltaY > 0 ? 1 : -1;
    
    const w = viewBox.value.w;
    const h = viewBox.value.h;
    
    // Limits
    if (direction < 0 && w < 400) return; // Max Zoom In
    if (direction > 0 && w > MAP_WIDTH * 2) return; // Max Zoom Out

    const newW = w * (1 + direction * zoomIntensity);
    const newH = h * (1 + direction * zoomIntensity);
    
    // Zoom towards center (simplification, real mouse pointer zoom is better but this is fine)
    const dx = (w - newW) / 2;
    const dy = (h - newH) / 2;
    
    viewBox.value.x += dx;
    viewBox.value.y += dy;
    viewBox.value.w = newW;
    viewBox.value.h = newH;
};

const handleMouseDown = (e: MouseEvent) => {
    isDragging.value = true;
    startPan.value = { x: e.clientX, y: e.clientY };
};

const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return;
    e.preventDefault();
    
    const dx = e.clientX - startPan.value.x;
    const dy = e.clientY - startPan.value.y;
    
    // Convert screen pixels to SVG units
    // We need the ratio of viewBox Width / Client Width
    // Since we don't have easy ref to element width in script setup without template ref, 
    // let's approximate or update startPan.
    // Actually, accurate drag requires scaling factor.
    
    // Let's assume the container is roughly standard scale or just settle for sensitivity tuning.
    // Better: Get ratio from viewBox.w / e.currentTarget.clientWidth
    // But currentTarget is generic EventTarget.
    
    const container = e.currentTarget as HTMLElement;
    const scaleX = viewBox.value.w / container.clientWidth;
    const scaleY = viewBox.value.h / container.clientHeight;

    viewBox.value.x -= dx * scaleX;
    viewBox.value.y -= dy * scaleY;
    
    startPan.value = { x: e.clientX, y: e.clientY };
};

const handleMouseUp = () => {
    isDragging.value = false;
};

</script>

<template>
  <div class="dungeon-map-container bg-slate-950 h-screen w-full flex overflow-hidden font-sans">
    
    <!-- Sidebar / HUD -->
    <div class="w-64 flex-shrink-0 flex flex-col border-r border-slate-800 bg-slate-900/90 text-slate-300 shadow-2xl z-20 backdrop-blur-md">
       <div class="p-6 border-b border-slate-700 bg-slate-900">
           <h1 class="text-xl font-bold text-slate-100 tracking-wider">DUNGEON MAP</h1>
           <div class="text-xs text-slate-500 mt-1 uppercase tracking-widest">Floor 1 - The Depths</div>
       </div>
       
       <div class="p-6 flex-1 overflow-y-auto">
           <h3 class="font-bold text-slate-100 mb-4 text-sm uppercase tracking-wider border-b border-slate-700/50 pb-2">Legend</h3>
           <div class="space-y-3">
               <div v-for="(color, type) in TYPE_COLORS" :key="type" class="flex items-center gap-3 bg-slate-800/50 p-2 rounded-md border border-slate-700/50">
                   <div class="w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow-sm" :style="{ backgroundColor: color, color: '#fff' }">
                       <span class="filter drop-shadow-md">{{ getNodeIcon(type as string) }}</span>
                   </div>
                   <span class="capitalize text-sm font-medium text-slate-200">{{ type }}</span>
               </div>
           </div>
       </div>

       <!-- Map Settings -->
       <div class="p-4 border-t border-slate-700 bg-slate-900/50">
           <h3 class="font-bold text-slate-100 mb-3 text-sm uppercase tracking-wider">Settings</h3>
           
           <div class="space-y-3">
               <div>
                   <label class="block text-xs text-slate-400 mb-1">Number of Floors</label>
                   <input 
                       type="number" 
                       v-model.number="floorCount" 
                       min="5" 
                       max="30"
                       class="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-amber-500"
                   />
               </div>
               
                <button 
                    @click="showRestartConfirm = true"
                    class="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded transition-colors text-sm"
                >
                    🔄 Restart Map
                </button>
                
                <button 
                    @click="revealAll = !revealAll"
                    :class="revealAll ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 hover:bg-slate-600'"
                    class="w-full text-white font-bold py-2 px-4 rounded transition-colors text-sm"
                >
                    {{ revealAll ? '👁️ Hide All' : '👁️ Reveal All' }}
                </button>
            </div>
       </div>

       <!-- Status / Footer -->
       <div class="p-4 bg-slate-950 text-xs text-slate-600 border-t border-slate-800">
           Mad Mage Roguelike Dev Build
       </div>
    </div>

    <!-- Map Viewport -->
    <div 
        class="flex-1 relative flex justify-center bg-black overflow-hidden relative cursor-grab active:cursor-grabbing"
        @wheel="handleWheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
    >
        <!-- Atmospheric Background Layers -->
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-80 pointer-events-none"></div>
        <div class="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-10"></div>
        
        <div class="relative h-full aspect-[800/800] max-w-5xl shadow-2xl backdrop-blur-sm transition-opacity duration-1000 pointer-events-none">
            <svg 
               v-if="mapData"
               :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`"
               class="w-full h-full filter drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] pointer-events-auto"
               preserveAspectRatio="xMidYMid meet" 
            >
              <defs>
                <!-- Generic Glow -->
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                   <feGaussianBlur stdDeviation="3" result="blur" />
                   <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              <!-- Edges (Background Faint) -->
              <path 
                v-for="(edge, i) in mapData.edges" 
                :key="`bg-edge-${i}`"
                :d="getEdgePath(edge, 0)" 
                class="stroke-slate-700 stroke-[2] opacity-20 fill-none"
                stroke-linecap="round"
              />

              <!-- Active/Wandering Paths (White Dashed - Path Taken) -->
              <path 
                v-for="(edge, i) in activeEdges" 
                :key="`active-edge-${i}`"
                :d="getEdgePath(edge, 20 + i % 30)" 
                stroke="#ffffff"
                stroke-width="3"
                fill="none"
                stroke-dasharray="10 6"
                stroke-linecap="round"
                style="filter: drop-shadow(0 0 8px rgba(255,255,255,0.7));"
              />
              
              <!-- Available Choice Paths (Amber/Gold - Current Choices) -->
              <path 
                v-for="(edge, i) in availableEdges" 
                :key="`choice-edge-${i}`"
                :d="getEdgePath(edge, 10 + i % 20)" 
                stroke="#f59e0b"
                stroke-width="3"
                fill="none"
                stroke-linecap="round"
                style="filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.8));"
              >
                <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
              </path>
              
              <!-- Nodes -->
              <g 
                v-for="node in mapData.nodes" 
                :key="node.id"
                :transform="`translate(${node.x}, ${node.y})`"
                class="group cursor-pointer"
                @click="handleNodeClick(node)"
              >
                 <!-- Glow Ring (On Hover or Available) -->
                 <circle 
                    v-if="node.status === 'available'"
                    r="28" 
                    class="transition-opacity duration-300 opacity-30 group-hover:opacity-100"
                    :fill="getNodeColor(node.type)"
                    filter="url(#glow)"
                 />
                 
                 <!-- Main Hex Shape -->
                 <polygon 
                   :points="hexPath" 
                   :class="getNodeClass(node)"
                   :fill="node.status === 'available' ? getNodeColor(node.type) : undefined"
                   class="transition-all duration-200 group-hover:brightness-110 group-active:scale-95"
                   :stroke="node.status === 'available' ? '#ffffff' : undefined"
                   stroke-width="1.5"
                 />
                 
                 <!-- Icon (Only show for available/visited nodes OR when revealAll is on) -->
                 <text 
                   v-if="revealAll || node.status === 'available' || node.status === 'visited'"
                   y="8" 
                   text-anchor="middle" 
                   class="text-[18px] pointer-events-none select-none font-bold filter drop-shadow-md transition-transform duration-200 group-hover:-translate-y-1 fill-white"
                 >
                    {{ getNodeIcon(node.type) }}
                 </text>
                 
                 <!-- Mystery icon for locked nodes (only when revealAll is off) -->
                 <text 
                   v-else
                   y="8" 
                   text-anchor="middle" 
                   class="text-[18px] pointer-events-none select-none fill-slate-700"
                 >
                    ?
                 </text>
              </g>
            </svg>
        </div>
    </div>
    
    <!-- Restart Confirmation Modal (Full Screen Overlay) -->
    <div 
        v-if="showRestartConfirm" 
        class="fixed top-0 left-0 w-screen h-screen flex items-center justify-center"
        style="z-index: 9999; background-color: rgba(0, 0, 0, 0.5);"
    >
        <div style="background-color: #1e293b;" class="border border-slate-700 rounded-lg p-6 max-w-sm text-center shadow-2xl">
            <h3 class="text-xl font-bold text-slate-100 mb-3">Restart Map?</h3>
            <p class="text-slate-400 text-sm mb-6">All progress will be lost.</p>
            <div class="flex gap-4">
                <button 
                    @click="showRestartConfirm = false"
                    class="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button 
                    @click="restartMap"
                    class="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    Restart
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles if needed, mostly using Tailwind */
</style>
