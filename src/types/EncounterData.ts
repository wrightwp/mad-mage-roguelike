import type { MonsterData } from './MonsterData';
import type { WinCondition } from './WinCondition';
import { EncounterType } from './EncounterType';
import { EncounterDifficulty } from './EncounterDifficulty';
import { EncounterAttitude } from './EncounterAttitude';

export interface ScalingMechanic {
    type: 'trap' | 'hazard' | 'skill' | 'puzzle' | 'other';
    id: string; // Unique ID for text replacement (e.g. "sm-0")
    subType?: string; // Specific skill or save (e.g., "Athletics", "Dex Save")
    dc?: number;
    damage?: string;
}

interface BaseEncounterData {
    id?: string; // Optional unique ID for tracking
    name: string;
    tier?: number; // Tier 1, 2, 3 etc.
    level: number; // Corresponds to Floor/CR
    difficulty: EncounterDifficulty;
    roomDescription: string; // Description visible to players
    dmDescription: string[]; // Additional details for the DM (bullet points)

    // Scaling Mechanics (Flexible array)
    scalingMechanics?: ScalingMechanic[];

    size: number; // Number of rooms/areas
    winConditions?: WinCondition[];
    lair?: boolean;
    aiRoomPrompt?: string; // For battle map generation
}

export interface CombatEncounterData extends BaseEncounterData {
    type: EncounterType.Combat;
    xpBudget: number;
    monsters: MonsterData[];
    attitude: EncounterAttitude;
    personality?: string; // cowardly, greedy, boastful, etc.
}

export interface SocialEncounterData extends BaseEncounterData {
    type: EncounterType.Social;
    monsters: MonsterData[]; // NPCs present
    attitude: EncounterAttitude;
    personality: string;
    xpBudget?: number; // Optional reward for interaction
    tradeGoods?: string[]; // Optional specific field example
    questHook?: string;
}

export interface ExplorationEncounterData extends BaseEncounterData {
    type: EncounterType.Exploration;
    xpBudget?: number;
    items?: string[]; // Found items
    traps?: string[]; // Description of hazards
    secretDoors?: boolean;
    // Optional puzzle-style fields (merged from former Puzzle encounters)
    puzzleDescription?: string; // Specific description of puzzle mechanics
    dc?: number;
    solution?: string;
    penalty?: string; // Consequence for failure
}

export interface RestEncounterData extends BaseEncounterData {
    type: EncounterType.Rest;
    healingBonus?: boolean;
    shelterQuality: 'poor' | 'good' | 'secure';
}

export type EncounterData =
    | CombatEncounterData
    | SocialEncounterData
    | ExplorationEncounterData
    | RestEncounterData
    | BossEncounterData
    | TreasureEncounterData;

export interface TreasureEncounterData extends BaseEncounterData {
    type: EncounterType.Treasure;
    xpBudget: number;
    items: string[];
    goldValue: number;
    hasTrap: boolean;
    trapDescription?: string;
    isLocked: boolean;
    lockDC?: number;
    isMimic: boolean;
}

export interface BossEncounterData extends BaseEncounterData {
    type: EncounterType.Boss;
    xpBudget: number;
    monsters: MonsterData[];
    attitude: EncounterAttitude;
    personality?: string;
    legendaryActions?: string[];
    lairActions?: string[];
    phases?: {
        name: string;
        trigger: string; // e.g., "At 50% HP"
        description: string;
    }[];
}
