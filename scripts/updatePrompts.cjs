const fs = require('fs');
const path = require('path');
const encounters = require('../src/data/encounters.json');

// Wall types for variety based on room theme
const getWallType = (name, roomDesc) => {
    const lower = (name + ' ' + roomDesc).toLowerCase();
    if (lower.includes('cave') || lower.includes('cavern') || lower.includes('den')) return 'rough stone walls';
    if (lower.includes('crypt') || lower.includes('tomb')) return 'ancient carved stone walls';
    if (lower.includes('temple') || lower.includes('shrine')) return 'ornate stone walls with carvings';
    if (lower.includes('sewer')) return 'damp brick walls';
    if (lower.includes('mine')) return 'rough-hewn rock walls with wooden supports';
    if (lower.includes('volcanic') || lower.includes('lava')) return 'dark volcanic stone walls';
    if (lower.includes('ice') || lower.includes('frozen')) return 'ice-covered stone walls';
    return 'stone dungeon walls';
};

// Entrance types for variety
const entranceTypes = [
    'Entry via stone staircase descending from above',
    'Entry through arched doorway at south',
    'Entry via ladder from trapdoor above',
    'Entry through narrow tunnel',
    'Entry via collapsed section in ceiling',
    'Entry through crumbling archway',
    'Entry via spiral stairs in corner',
    'Entry through fissure in the rock'
];

encounters.forEach((enc, i) => {
    const oldPrompt = enc.aiRoomPrompt || '';
    const size = enc.size || 1;
    const wallType = getWallType(enc.name, enc.roomDescription || '');
    const entrance = entranceTypes[i % entranceTypes.length];

    // Determine exit count based on size
    let exitPhrase;
    switch (size) {
        case 1: exitPhrase = 'Single exit opposite the entrance'; break;
        case 2: exitPhrase = 'Two exits on opposite walls'; break;
        case 3: exitPhrase = 'Three exits spread across walls'; break;
        default: exitPhrase = 'Multiple exits around the perimeter'; break;
    }

    // Extract dimensions from old prompt
    const dimMatch = oldPrompt.match(/(\d+ft\s*x\s*\d+ft)/i);
    const dimensions = dimMatch ? dimMatch[1] : '100ft x 100ft';

    // Extract room type/description
    let roomType = 'dungeon chamber';
    const lowerPrompt = oldPrompt.toLowerCase();
    if (lowerPrompt.includes('cave') || lowerPrompt.includes('cavern')) roomType = 'dungeon cavern';
    if (lowerPrompt.includes('crypt')) roomType = 'burial crypt';
    if (lowerPrompt.includes('temple')) roomType = 'temple chamber';
    if (lowerPrompt.includes('sewer')) roomType = 'sewer junction';
    if (lowerPrompt.includes('shrine')) roomType = 'shrine chamber';
    if (lowerPrompt.includes('mine')) roomType = 'mine tunnel';

    // Extract lighting
    let lighting = 'Dim torchlight';
    if (lowerPrompt.includes('bioluminescent')) lighting = 'Dim bioluminescent lighting';
    if (lowerPrompt.includes('magical') || lowerPrompt.includes('green glow')) lighting = 'Magical glow';
    if (lowerPrompt.includes('orange glow')) lighting = 'Orange glow from below';
    if (lowerPrompt.includes('no light')) lighting = 'No light sources (darkness)';
    if (lowerPrompt.includes('candlelight')) lighting = 'Flickering candlelight';
    if (lowerPrompt.includes('blue-white')) lighting = 'Cold blue-white lighting';

    // Extract key features - get middle content
    let features = '';
    // Try to extract content between lighting description and exit info
    const parts = oldPrompt.split('.');
    if (parts.length > 3) {
        // Skip first 2 parts (size/type and lighting) and last 2 (entrance/exit and VTT)
        const middleParts = parts.slice(2, -2);
        features = middleParts.join('.').trim();
    }

    // Build new prompt
    const newPrompt = [
        "Top-down bird's eye view battle map for tabletop RPG with 5ft square grid overlay",
        dimensions + ' underground ' + roomType + ' with ' + wallType,
        lighting,
        features || 'Stone floor with scattered debris',
        entrance,
        exitPhrase,
        'Clean lines, high contrast for virtual tabletop use'
    ].filter(p => p).join('. ') + '.';

    enc.aiRoomPrompt = newPrompt;
});

fs.writeFileSync(path.join(__dirname, '../src/data/encounters.json'), JSON.stringify(encounters, null, 4));
console.log('Updated ' + encounters.length + ' encounter prompts with new format');
