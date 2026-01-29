import type { DungeonNode } from './DungeonNode';
// We might need to import PartyMember type if it exists, or define it here if it's currently ad-hoc.
// For now, I will assume a basic structure or import if I find it. 
// Looking at previous context, PartyMember isn't explicitly in a file yet, usually in components.
// I'll define a placeholder or check where it is. 
// Wait, 'Live Party Configuration' added party members. Let's assume a generic shape or 'any' for now and refine.

export interface Campaign {
    id: string; // UUID
    name: string;
    created: number;
    lastPlayed: number;

    // Meta-Progression
    gold: number; // Global gold for upgrades
    xp: number;   // Global XP for trees
    talents: Record<string, number>; // Tree ID -> Rank
    portalUpgrades: Record<string, number>; // Upgrade ID -> Rank

    // Current Run (Nullable if no active run)
    currentRun?: RunState;

    // History
    runHistory: RunMetrics[];
}

export interface RunState {
    currentFloorId: string;
    floors: Record<string, FloorData>; // Floor ID -> Floor Data
    partyState: PartyMemberState[];
    partyConfig: {
        size: number;
        level: number;
    };
}

export interface FloorData {
    id: string;
    floorNumber: number;
    layout: DungeonNode[];
    status: 'active' | 'completed' | 'failed';
    visitedNodes: string[]; // List of IDs
    metrics: {
        goldEarned: number;
        xpEarned: number;
    };
    encounterResults: Record<string, { xp: number; gold: number; conditions: string[]; customXP?: number; customGold?: number }>;
}

export interface RunMetrics {
    id: string;
    startTime: number;
    endTime?: number;
    reachedFloor: number;
    goldEarned: number;
    xpEarned: number;
    status: 'abandoned' | 'victory' | 'defeat';
}

export interface PartyMemberState {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    // Add other stats as needed
}

import type { MonsterData } from './MonsterData';

export interface SaveFileExport {
    version: number;
    timestamp: number;
    campaigns: Campaign[];
    monsters?: MonsterData[];
}
