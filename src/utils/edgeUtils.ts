import type { DungeonMapData } from '../types';

export const getEdgePath = (
    edge: { from: string; to: string },
    mapData: DungeonMapData | null,
    seedOffset: number = 0
): string => {
    if (!mapData) return '';

    const n1 = mapData.nodes.find(n => n.id === edge.from);
    const n2 = mapData.nodes.find(n => n.id === edge.to);
    if (!n1 || !n2) return '';

    // Curvature logic
    const midX = (n1.x + n2.x) / 2;
    const midY = (n1.y + n2.y) / 2;

    const dx = n2.x - n1.x;
    const dy = n2.y - n1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

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
