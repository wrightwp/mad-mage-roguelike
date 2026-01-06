<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { generateDungeon } from '../logic/dungeonGen';
import type { DungeonMapData, DungeonNode } from '../types';

// Import background images
import outerBg from '../assets/clean_dungeon_bg.png';
import dungeonMapBg from '../assets/dungeon_map_bg.png';
import headerDecoration from '../assets/header_decoration.png';

const MAP_WIDTH = 800;
const MAP_HEIGHT = 2000;
const HEX_SIZE = 40;

const mapData = ref<DungeonMapData | null>(null);
const viewBox = ref({ x: 0, y: 0, w: MAP_WIDTH, h: 800 }); // Partial view

// Selection
const selectedNodeId = ref<string | null>(null);
const selectedNode = computed(() => {
    if (!mapData.value || !selectedNodeId.value) return null;
    return mapData.value.nodes.find(n => n.id === selectedNodeId.value) || null;
});

// Settings
const floorCount = ref(15);
const showRestartConfirm = ref(false);
const revealAll = ref(false);

const nodeTypeCounts = ref<Record<string, number>>({
    monster: 30,
    elite: 10,
    event: 8,
    rest: 6,
    treasure: 5,
    shop: 4,
    puzzle: 4
});

// Resizable Panels State
const leftPanelWidth = ref(320);
const rightPanelWidth = ref(420);
const isResizingLeft = ref(false);
const isResizingRight = ref(false);

const startResizingLeft = (e: MouseEvent) => {
    isResizingLeft.value = true;
    e.preventDefault();
};

const startResizingRight = (e: MouseEvent) => {
    isResizingRight.value = true;
    e.preventDefault();
};

const handleGlobalMouseMove = (e: MouseEvent) => {
    if (isResizingLeft.value) {
        // Enforce min 320, and ensure map stays at least 800
        // Map space = windowWidth - leftPanelWidth - rightPanelWidth
        // leftPanelWidth < windowWidth - rightPanelWidth - 800
        const maxWidth = window.innerWidth - rightPanelWidth.value - 800;
        leftPanelWidth.value = Math.max(320, Math.min(e.clientX, maxWidth));
    } else if (isResizingRight.value) {
        // Enforce min 420, and ensure map stays at least 800
        // rightPanelWidth = windowWidth - e.clientX
        // rightPanelWidth < windowWidth - leftPanelWidth - 800
        const maxWidth = window.innerWidth - leftPanelWidth.value - 800;
        const targetWidth = window.innerWidth - e.clientX;
        rightPanelWidth.value = Math.max(420, Math.min(targetWidth, maxWidth));
    }
};

const stopResizing = () => {
    isResizingLeft.value = false;
    isResizingRight.value = false;
};

// Init
onMounted(() => {
  initMap();
  window.addEventListener('mousemove', handleGlobalMouseMove);
  window.addEventListener('mouseup', stopResizing);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleGlobalMouseMove);
  window.removeEventListener('mouseup', stopResizing);
});

const initMap = () => {
  mapData.value = generateDungeon(floorCount.value, MAP_WIDTH, MAP_HEIGHT, nodeTypeCounts.value);
  visitedPath.value = [];
  selectedNodeId.value = null;
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
   // Always set selection
   selectedNodeId.value = node.id;

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
    rest: '#3e2723',    // Deep Brown / Sienna for contrast
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
  <div class="dungeon-map-container h-screen w-full flex overflow-x-auto overflow-y-hidden font-sans relative">
    <div 
        class="fixed inset-0 z-0 bg-no-repeat pointer-events-none" 
        :style="{ 
            backgroundImage: `url(${outerBg})`,
            backgroundAttachment: 'fixed',
            backgroundSize: '2560px auto',
            backgroundPosition: 'center top'
        }"
    ></div>

    <!-- Left Sidebar: Map Controls & Legend -->
    <div 
        class="flex-shrink-0 flex flex-col border-r border-slate-800 bg-slate-900/90 text-slate-300 shadow-2xl z-20 backdrop-blur-md relative transform-gpu overflow-hidden"
        :style="{ width: leftPanelWidth + 'px' }"
    >
       <div class="p-6 border-b border-slate-700 bg-slate-900 relative overflow-hidden" :style="{ backgroundImage: `url(${headerDecoration})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
           <div class="absolute inset-0 bg-slate-900/80"></div>
           <h1 class="text-2xl font-bold text-amber-400 tracking-wider fantasy-header mystical-glow relative z-10">DUNGEON MAP</h1>
           <div class="text-xs text-purple-300 mt-1 uppercase tracking-widest relative z-10" style="font-family: 'Cinzel', serif;">Undermountain - Halaster's Domain</div>
       </div>
       
       <div class="p-6 flex-1 overflow-y-auto custom-scrollbar">
           <h3 class="font-bold text-slate-100 mb-4 text-sm uppercase tracking-wider border-b border-slate-700/50 pb-2">Legend & Config</h3>
           <div class="space-y-4">
               <div v-for="(color, type) in TYPE_COLORS" :key="type">
                   <div v-if="type !== 'boss' && type !== 'start'" class="space-y-2">
                       <div class="flex items-center gap-3">
                           <div class="w-10 h-10 rounded-lg flex items-center justify-center text-2xl shadow-lg border border-white/10" :style="{ backgroundColor: color, color: '#fff' }">
                               <span v-if="type !== 'rest'" class="filter drop-shadow-md">{{ getNodeIcon(type as string) }}</span>
                               <!-- Small Campfire for Legend -->
                               <svg v-else viewBox="-30 -30 60 60" class="w-7 h-7 filter drop-shadow-md">
                                    <rect x="-24" y="8" width="48" height="8" rx="2" fill="#5d4037" transform="rotate(-15)" />
                                    <rect x="-24" y="8" width="48" height="8" rx="2" fill="#4e342e" transform="rotate(15)" />
                                    <rect x="-20" y="4" width="40" height="8" rx="2" fill="#3e2723" />
                                    <path d="M -15 4 Q -20 -15 0 -35 Q 20 -15 15 4 Z" fill="#ef4444" />
                                    <path d="M -10 4 Q -15 -10 0 -25 Q 15 -10 10 4 Z" fill="#f59e0b" />
                               </svg>
                           </div>
                           <div class="flex-1">
                               <div class="capitalize text-xs font-bold text-slate-400 uppercase tracking-tighter">{{ type }}</div>
                               <input 
                                   type="number" 
                                   v-model.number="nodeTypeCounts[type]" 
                                   min="0" 
                                   max="50"
                                   class="w-full bg-slate-800/50 border border-slate-700/50 rounded px-2 py-1 text-slate-200 text-sm focus:outline-none focus:border-amber-500/50 mt-1"
                               />
                           </div>
                       </div>
                   </div>
                   <div v-else class="flex items-center gap-3 opacity-60">
                       <div class="w-10 h-10 rounded-lg flex items-center justify-center text-2xl shadow-lg border border-white/10" :style="{ backgroundColor: color, color: '#fff' }">
                           <span class="filter drop-shadow-md">{{ getNodeIcon(type as string) }}</span>
                       </div>
                       <span class="capitalize text-sm font-medium text-slate-200">{{ type }}</span>
                   </div>
               </div>
           </div>
       </div>

       <!-- Map Settings -->
       <div class="p-4 border-t border-slate-700 bg-slate-900/50">
           <h3 class="font-bold text-slate-100 mb-3 text-sm uppercase tracking-wider">World Settings</h3>
           
           <div class="space-y-3">
               <div>
                   <label class="block text-xs text-slate-400 mb-1 tracking-widest uppercase">Floor Depth</label>
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
                    class="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 px-4 rounded transition-all transform active:scale-95 text-sm shadow-lg shadow-amber-900/20"
                >
                    🔄 Regenerate Map
                </button>
                
                <button 
                    @click="revealAll = !revealAll"
                    :class="revealAll ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 hover:bg-slate-600'"
                    class="w-full text-white font-bold py-2.5 px-4 rounded transition-all text-sm"
                >
                    {{ revealAll ? '👁️ Hide All' : '👁️ Reveal All' }}
                </button>
            </div>
       </div>

       <div class="p-4 bg-slate-950 text-[10px] text-slate-600 border-t border-slate-800 flex justify-between uppercase tracking-widest">
           <span>v0.2.0</span>
           <span>Preview Build</span>
       </div>
    </div>

    <!-- Left Resizer -->
    <div 
       class="w-1.5 h-full cursor-col-resize z-30 hover:bg-amber-500/30 transition-colors flex items-center justify-center group active:bg-amber-500/50"
       @mousedown="startResizingLeft"
    >
       <div class="w-px h-12 bg-slate-700 group-hover:bg-amber-500/50"></div>
    </div>

    <!-- Map Viewport -->
    <div 
        class="flex-1 min-w-[800px] relative flex justify-center bg-black overflow-hidden cursor-grab active:cursor-grabbing z-10"
        @wheel="handleWheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
    >
        <div class="absolute inset-0 pointer-events-none" :style="{ backgroundImage: `url(${dungeonMapBg})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-slate-950/80 to-black opacity-90 pointer-events-none"></div>
        
        <div class="relative h-full aspect-[800/2000] w-full shadow-2xl backdrop-blur-[2px] pointer-events-none">
            <svg 
               v-if="mapData"
               :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`"
               class="w-full h-full filter drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] pointer-events-auto"
               preserveAspectRatio="xMidYMid meet" 
            >
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                   <feGaussianBlur stdDeviation="3" result="blur" />
                   <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="strong-glow" x="-50%" y="-50%" width="200%" height="200%">
                   <feGaussianBlur stdDeviation="6" result="blur" />
                   <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              <!-- Edges -->
              <path 
                v-for="(edge, i) in mapData.edges" 
                :key="`bg-edge-${i}`"
                :d="getEdgePath(edge, 0)" 
                class="stroke-slate-800 stroke-[2] opacity-30 fill-none"
                stroke-linecap="round"
              />

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
                <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" />
              </path>
              
              <!-- Nodes -->
              <g 
                v-for="node in mapData.nodes" 
                :key="node.id"
                :transform="`translate(${node.x}, ${node.y})`"
                class="group cursor-pointer"
                @click="handleNodeClick(node)"
              >
                 <!-- Selection Highlight -->
                 <circle 
                    v-if="selectedNodeId === node.id"
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
                   :fill="node.status === 'available' ? getNodeColor(node.type) : (selectedNodeId === node.id ? '#1e293b' : undefined)"
                   class="transition-all duration-200 group-hover:brightness-125 group-active:scale-90"
                   :stroke="selectedNodeId === node.id ? '#fbbf24' : (node.status === 'available' ? '#ffffff' : '#475569')"
                   :stroke-width="selectedNodeId === node.id ? 3 : 1.5"
                 />
                 
                 <text 
                   v-if="(revealAll || node.status === 'available' || node.status === 'visited') && node.type !== 'rest'"
                   y="10" 
                   text-anchor="middle" 
                   class="text-[24px] pointer-events-none select-none font-bold filter drop-shadow-md transition-transform duration-200 group-hover:-translate-y-1 fill-white"
                 >
                    {{ getNodeIcon(node.type) }}
                 </text>

                 <!-- Custom Campfire Icon for Rest -->
                 <g v-else-if="revealAll || node.status === 'available' || node.status === 'visited'" transform="translate(0, 0)" class="pointer-events-none">
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
            </svg>
        </div>
    </div>

    <!-- Right Resizer -->
    <div 
        class="w-1.5 h-full cursor-col-resize z-30 hover:bg-amber-500/30 transition-colors flex items-center justify-center group active:bg-amber-500/50"
        @mousedown="startResizingRight"
     >
        <div class="w-px h-12 bg-slate-700 group-hover:bg-amber-500/50"></div>
     </div>

    <!-- Right Sidebar: Encounter Info -->
    <div 
        class="flex-shrink-0 flex flex-col border-l border-slate-800 bg-slate-900/95 text-slate-300 shadow-2xl z-20 backdrop-blur-md relative transform-gpu overflow-hidden"
        :style="{ width: rightPanelWidth + 'px' }"
    >
        <div class="p-6 border-b border-slate-700 bg-slate-950/50">
            <h3 class="font-bold text-amber-500 mb-1 text-xs uppercase tracking-[0.2em]">Encounter Details</h3>
            <h2 class="text-xl font-bold text-slate-100 tracking-tight">
                {{ selectedNode ? (selectedNode.type === 'start' ? 'Dungeon Entrance' : selectedNode.type === 'boss' ? 'Boss Chamber' : selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)) : 'No Selection' }}
            </h2>
        </div>

        <div v-if="selectedNode" class="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
            <!-- Icon Display -->
            <div class="flex justify-center py-4">
                <div class="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl shadow-2xl border-2 border-white/10 relative overflow-hidden" :style="{ backgroundColor: getNodeColor(selectedNode.type) }">
                    <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <span v-if="selectedNode.type !== 'rest'" class="relative z-10 filter drop-shadow-lg">{{ getNodeIcon(selectedNode.type) }}</span>
                    <!-- Larger Campfire for Panel -->
                    <svg v-else viewBox="-30 -40 60 60" class="w-20 h-20 relative z-10 drop-shadow-xl">
                        <rect x="-24" y="8" width="48" height="8" rx="2" fill="#5d4037" transform="rotate(-15)" />
                        <rect x="-24" y="8" width="48" height="8" rx="2" fill="#4e342e" transform="rotate(15)" />
                        <rect x="-20" y="4" width="40" height="8" rx="2" fill="#3e2723" />
                        <path d="M -15 4 Q -20 -15 0 -35 Q 20 -15 15 4 Z" fill="#ef4444" />
                        <path d="M -10 4 Q -15 -10 0 -25 Q 15 -10 10 4 Z" fill="#f59e0b" />
                    </svg>
                </div>
            </div>

            <!-- Stats/Info -->
            <div class="space-y-4">
                <div class="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                    <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Description</div>
                    <p class="text-sm text-slate-200 leading-relaxed font-serif italic">
                        {{ selectedNode.description || 'A mysterious chamber hidden deep within the Undermountain.' }}
                    </p>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
                        <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Exits</div>
                        <div class="text-lg font-bold text-amber-400">{{ selectedNode.connections.length }}</div>
                    </div>
                    <div class="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
                        <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Status</div>
                        <div class="text-sm font-bold capitalize" :class="{
                            'text-emerald-400': selectedNode.status === 'visited',
                            'text-amber-400': selectedNode.status === 'available',
                            'text-slate-500': selectedNode.status === 'locked'
                        }">{{ selectedNode.status }}</div>
                    </div>
                </div>

                <div v-if="selectedNode.type === 'monster' || selectedNode.type === 'elite'" class="bg-red-900/10 rounded-xl p-4 border border-red-900/30">
                    <div class="text-[10px] text-red-400 uppercase tracking-widest mb-2 font-bold">Threat Assessment</div>
                    <div class="flex items-center gap-2">
                        <span v-for="i in (selectedNode.type === 'elite' ? 3 : 1)" :key="i">💀</span>
                        <span class="text-xs text-red-200/70 font-medium ml-2">
                            {{ selectedNode.type === 'elite' ? 'High Danger' : 'Standard Encounter' }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
            <div class="text-4xl">🗺️</div>
            <p class="text-sm uppercase tracking-widest px-8">Select a node on the map to view detailed encounter information</p>
        </div>

        <div class="p-4 bg-slate-950/80 border-t border-slate-800">
            <button 
                v-if="selectedNode && selectedNode.status === 'available'"
                @click="handleNodeClick(selectedNode)"
                class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95 flex items-center justify-center gap-2"
            >
                <span>Enter Encounter</span>
                <span class="text-xl">➔</span>
            </button>
            <div v-else class="text-center py-3 text-xs text-slate-600 uppercase tracking-widest font-bold">
                {{ selectedNode ? (selectedNode.status === 'visited' ? 'Already Visited' : 'Path Blocked') : 'Waiting for Input' }}
            </div>
        </div>
    </div>
    
    <!-- Restart Confirmation Modal -->
    <div 
        v-if="showRestartConfirm" 
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
        <div class="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all scale-100">
            <div class="w-16 h-16 bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">⚠️</div>
            <h3 class="text-2xl font-bold text-slate-100 mb-2">Reset Journey?</h3>
            <p class="text-slate-400 text-sm mb-8 leading-relaxed">All progress in this descent will be lost. The Undermountain will shift and reshape itself.</p>
            <div class="flex gap-4">
                <button 
                    @click="showRestartConfirm = false"
                    class="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-xl transition-colors border border-slate-700"
                >
                    Stay
                </button>
                <button 
                    @click="restartMap"
                    class="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-red-900/40"
                >
                    Reset
                </button>
            </div>
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
