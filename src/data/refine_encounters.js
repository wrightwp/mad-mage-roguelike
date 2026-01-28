
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, 'encounters-tier-1.json');

// Regex patterns
const DC_REGEX = /DC\s*(\d+)\s*([a-zA-Z0-9\s'\-()]+)(?=[.,;:+|{]|$)/g;
const DMG_REGEX = /(\d+d\d+)\s*([a-zA-Z\s'-]*?)\s*damage/g;

try {
    const data = fs.readFileSync(filePath, 'utf8');
    let encounters = JSON.parse(data);
    let updatedCount = 0;

    encounters = encounters.map((enc) => {
        let changed = false;

        // Ensure mechanics array exists
        if (!enc.scalingMechanics) enc.scalingMechanics = [];

        // Determine next ID suffix
        let maxId = -1;
        enc.scalingMechanics.forEach(m => {
            if (m.id && m.id.startsWith('sm-')) {
                const num = parseInt(m.id.split('-')[1]);
                if (!isNaN(num) && num > maxId) maxId = num;
            }
        });
        let mechCounter = maxId + 1;

        const processText = (text) => {
            if (!text || typeof text !== 'string') return text;

            let processedText = text;
            let textChanged = false; // Local tracking for this string

            // 1. DCs
            DC_REGEX.lastIndex = 0;
            const dcMatches = [];
            let match;
            while ((match = DC_REGEX.exec(text)) !== null) {
                dcMatches.push({
                    full: match[0],
                    val: parseInt(match[1]),
                    name: match[2].trim(),
                    index: match.index
                });
            }

            for (let i = dcMatches.length - 1; i >= 0; i--) {
                const m = dcMatches[i];
                const id = `sm-${mechCounter++}`;

                enc.scalingMechanics.push({
                    id: id,
                    type: m.name.includes('Save') ? 'trap' : 'skill',
                    subType: m.name || 'Check',
                    dc: m.val
                });

                const before = processedText.substring(0, m.index);
                const after = processedText.substring(m.index + m.full.length);
                processedText = `${before}{{${id}}}${after}`;
                textChanged = true;
            }

            // 2. Damage
            DMG_REGEX.lastIndex = 0;
            const dmgMatches = [];
            while ((match = DMG_REGEX.exec(text)) !== null) {
                dmgMatches.push({
                    full: match[0],
                    val: match[1],
                    type: match[2].trim(),
                    index: match.index
                });
            }

            for (let i = dmgMatches.length - 1; i >= 0; i--) {
                const m = dmgMatches[i];
                const id = `sm-${mechCounter++}`;

                enc.scalingMechanics.push({
                    id: id,
                    type: 'hazard',
                    subType: `${m.type} Damage`,
                    damage: m.val
                });

                const before = processedText.substring(0, m.index);
                const after = processedText.substring(m.index + m.full.length);
                processedText = `${before}{{${id}}}${after}`;
                textChanged = true;
            }

            if (textChanged) changed = true;
            return processedText;
        };

        // --- Apply to Fields ---

        // 1. dmDescription (Array or String)
        if (Array.isArray(enc.dmDescription)) {
            enc.dmDescription = enc.dmDescription.map(line => processText(line));
        } else if (typeof enc.dmDescription === 'string') {
            enc.dmDescription = [processText(enc.dmDescription)];
        }

        // 2. roomDescription (String)
        if (enc.roomDescription) {
            enc.roomDescription = processText(enc.roomDescription);
        }

        // 3. trapDescription (String) - specific to Treasure/Exploration
        if (enc.trapDescription) {
            enc.trapDescription = processText(enc.trapDescription);
        }

        // 4. puzzleDescription (String) - specific to Puzzle/Exploration
        if (enc.puzzleDescription) {
            enc.puzzleDescription = processText(enc.puzzleDescription);
        }

        // 5. winConditions (Array of Objects)
        if (enc.winConditions && Array.isArray(enc.winConditions)) {
            enc.winConditions = enc.winConditions.map(wc => {
                if (wc.condition) {
                    wc.condition = processText(wc.condition);
                }
                // Optional: check reward text too? "Gain 50 GP" -> usually static, but could have "DC 10 for bonus".
                // Let's safe-check reward too.
                if (wc.reward) {
                    wc.reward = processText(wc.reward);
                }
                return wc;
            });
        }

        if (changed) updatedCount++;
        return enc;
    });

    if (updatedCount > 0) {
        fs.writeFileSync(filePath, JSON.stringify(encounters, null, 4), 'utf8');
        console.log(`Successfully updated ${updatedCount} encounters with broader scaling placeholders.`);
    } else {
        console.log("No new scaling patterns found in broad scan.");
    }

} catch (err) {
    console.error("Error:", err);
    process.exit(1);
}
