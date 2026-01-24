// Script to update encounters with xpReward and goldReward fields
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(__dirname, 'encounters-floor-01.json');
const data = JSON.parse(readFileSync(filePath, 'utf-8'));

// Helper function to parse XP from reward text
function parseXP(reward, xpBudget) {
    if (!reward) return 0;

    // Check for explicit XP values like "250 XP" or "Full XP (250)"
    const explicitMatch = reward.match(/(\d+)\s*XP/i);
    if (explicitMatch) return parseInt(explicitMatch[1]);

    // Check for percentage-based XP
    const percentMatch = reward.match(/(\d+)%\s*XP/i);
    if (percentMatch && xpBudget) {
        return Math.round(xpBudget * (parseInt(percentMatch[1]) / 100));
    }

    // Check for "Full XP" without explicit number
    if (/full\s*xp/i.test(reward) && xpBudget) {
        return xpBudget;
    }

    // Check for "bonus XP" additions
    const bonusMatch = reward.match(/\+\s*(\d+)\s*(?:bonus\s*)?XP/i);
    if (bonusMatch && xpBudget) {
        return xpBudget + parseInt(bonusMatch[1]);
    }

    // No XP or explicitly "No XP"
    if (/no\s*xp/i.test(reward)) return 0;

    return 0;
}

// Helper function to parse Gold from reward text
function parseGold(reward) {
    if (!reward) return 0;

    // Check for gold values like "25 gp" or "25 gold" or "25gp"
    const goldMatch = reward.match(/(\d+)\s*(?:gp|gold|GP)/i);
    if (goldMatch) return parseInt(goldMatch[1]);

    return 0;
}

let updatedCount = 0;

// Process each encounter
data.forEach(encounter => {
    const xpBudget = encounter.xpBudget || 0;

    if (encounter.winConditions && encounter.winConditions.length > 0) {
        encounter.winConditions.forEach(cond => {
            // Only update if xpReward or goldReward is missing
            if (cond.xpReward === undefined) {
                cond.xpReward = parseXP(cond.reward, xpBudget);
                updatedCount++;
            }
            if (cond.goldReward === undefined) {
                cond.goldReward = parseGold(cond.reward);
            }
        });
    }
});

// Write the updated file
writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf-8');

console.log(`Updated ${updatedCount} win conditions with xpReward/goldReward fields.`);
console.log('File saved successfully.');
