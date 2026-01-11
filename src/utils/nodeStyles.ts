import type { DungeonNode } from '../types';

export const TYPE_COLORS: Record<string, string> = {
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

export const TYPE_ICONS: Record<string, string> = {
    monster: '⚔️',
    elite: '💀',
    event: '?',
    rest: '🔥',
    shop: '💰',
    treasure: '💎',
    puzzle: '🧩',
    boss: '👹',
    start: '🏠'
};

export const getNodeColor = (type: string): string => {
    return TYPE_COLORS[type] || '#fff';
};

export const getNodeIcon = (type: string): string => {
    return TYPE_ICONS[type] || '';
};

export const getNodeClass = (node: DungeonNode): string => {
    const base = "transition-all duration-300 stroke-2 cursor-pointer ";

    if (node.status === 'visited') return base + "fill-slate-700 stroke-slate-500 opacity-70";
    if (node.status === 'locked') return base + "fill-slate-800 stroke-slate-700 opacity-40 pointer-events-none";
    if (node.status === 'current') return base + "mystical-glow ring-2 ring-amber-400";

    return base;
};
