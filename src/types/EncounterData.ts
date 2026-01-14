import type { MonsterData } from './MonsterData';
import type { WinCondition } from './WinCondition';
import { EncounterType } from './EncounterType';
import { EncounterDifficulty } from './EncounterDifficulty';
import { EncounterAttitude } from './EncounterAttitude';

export interface EncounterData {
    name: string;
    level: number;
    type: EncounterType;
    difficulty: EncounterDifficulty;
    xpBudget: number | false; // FALSE for non-combat encounters
    monsters?: MonsterData[]; // Array of monster objects
    attitude?: EncounterAttitude;
    personality?: string; // cowardly, greedy, boastful, etc.
    roomDescription: string; // Description visible to players
    dmDescription: string; // Additional details for the DM
    size: number; // Number of rooms/areas
    winConditions?: WinCondition[];
    aiRoomPrompt?: string; // For battle map generation
    lair: boolean; // Is this a lair encounter?
}
