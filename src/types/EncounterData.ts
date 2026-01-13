export interface EncounterData {
    name: string;
    level: number;
    type: 'combat' | 'exploration' | 'social' | 'puzzle';
    difficulty: 'low' | 'moderate' | 'high';
    xpBudget: number | false; // FALSE for non-combat encounters
    creatures?: string; // Comma-separated list
    attitude?: 'hostile' | 'indifferent' | 'friendly';
    personality?: string; // cowardly, greedy, boastful, etc.
    description: string;
    size: number; // Number of rooms/areas
    winConditionA?: string;
    rewardA?: string;
    winConditionB?: string;
    rewardB?: string;
    aiRoomPrompt?: string; // For battle map generation
    lair: boolean; // Is this a lair encounter?
}
