import type { MonsterData } from './MonsterData';
import type { WinCondition } from './WinCondition';
import { EncounterType } from './EncounterType';
import { EncounterDifficulty } from './EncounterDifficulty';
import { EncounterAttitude } from './EncounterAttitude';

interface BaseEncounterData {
    id?: string; // Optional unique ID for tracking
    name: string;
    level: number; // Corresponds to Floor/CR
    difficulty: EncounterDifficulty;
    roomDescription: string; // Description visible to players
    dmDescription: string; // Additional details for the DM
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

export interface PuzzleEncounterData extends BaseEncounterData {
    type: EncounterType.Puzzle;
    puzzleDescription: string; // Specific description of the puzzle mechanics
    dc?: number;
    solution?: string;
    xpBudget: number; // Reward for solving
    penalty?: string; // Consequence for failure
}

export interface ExplorationEncounterData extends BaseEncounterData {
    type: EncounterType.Exploration;
    xpBudget?: number;
    items?: string[]; // Found items
    traps?: string[]; // Description of hazards
    secretDoors?: boolean;
}

export interface RestEncounterData extends BaseEncounterData {
    type: EncounterType.Rest;
    healingBonus?: boolean;
    shelterQuality: 'poor' | 'good' | 'secure';
}

export type EncounterData =
    | CombatEncounterData
    | SocialEncounterData
    | PuzzleEncounterData
    | ExplorationEncounterData
    | RestEncounterData;
