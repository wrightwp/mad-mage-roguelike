export interface EncounterData {
    name: string;
    level: number;
    type: 'combat' | 'exploration' | 'social' | 'puzzle';
    difficulty: 'low' | 'moderate' | 'high';
    xpBudget: number | false; // FALSE for non-combat encounters
    creatures?: string; // Comma-separated list
    attitude?: 'hostile' | 'indifferent' | 'friendly';
    personality?: string; // cowardly, greedy, boastful, etc.
    roomDescription: string; // Description visible to players
    dmDescription: string; // Additional details for the DM
    size: number; // Number of rooms/areas
    winConditions?: Array<{
        condition: string;
        reward: string;
    }>;
    aiRoomPrompt?: string; // For battle map generation
    lair: boolean; // Is this a lair encounter?
}
