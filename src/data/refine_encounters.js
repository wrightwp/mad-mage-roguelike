
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, 'encounters-tier-1.json');

// Regex patterns
const DC_REGEX = /DC (\d+) ([a-zA-Z\s]+?)(?=[).,]|$)/g;
const DMG_REGEX = /(\d+d\d+) ([a-zA-Z\s]+?) damage/g;

try {
    const data = fs.readFileSync(filePath, 'utf8');
    let encounters = JSON.parse(data);
    let updatedCount = 0;

    encounters = encounters.map(enc => {
        let changed = false;

        // Reset or init scalingMechanics for a fresh pass to ensure IDs match text
        // (Assuming we want to regenerate mechanics to link them perfectly)
        // But the previous pass already created them without IDs. 
        // Let's clear and re-generate to ensure perfect sync, 
        // OR we map existing ones. Re-generating is safer for "Integration".
        enc.scalingMechanics = [];
        let mechCounter = 0;

        // Combine descriptions to process full text then split again, 
        // OR process line by line. Line by line is safer for existing structure.

        const processText = (text) => {
            let processedText = text;

            // 1. DCs
            // Reset regex lastIndex
            DC_REGEX.lastIndex = 0;
            let match;
            // We need to replace match-by-match. 
            // replacing while iterating regex can be tricky with indices.
            // Better to find all matches, then replace.
            const dcMatches = [];
            while ((match = DC_REGEX.exec(text)) !== null) {
                dcMatches.push({
                    full: match[0],
                    val: parseInt(match[1]),
                    name: match[2].trim(),
                    index: match.index
                });
            }

            // Process matches in reverse order so replacements don't mess up indices
            for (let i = dcMatches.length - 1; i >= 0; i--) {
                const m = dcMatches[i];
                const id = `sm-${mechCounter++}`;

                enc.scalingMechanics.push({
                    id: id,
                    type: m.name.includes('Save') ? 'trap' : 'skill',
                    subType: m.name,
                    dc: m.val
                });

                // Replace in text
                // Check if wrapped in paren to avoid double paren? 
                // The regex includes "DC 12 Name".
                // We replace "DC 12 Name" with "{{sm-X}}"

                // Construct replacement based on location
                const before = processedText.substring(0, m.index);
                const after = processedText.substring(m.index + m.full.length);
                processedText = `${before}{{${id}}}${after}`;
                changed = true;
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
                changed = true;
            }

            return processedText;
        };

        if (Array.isArray(enc.dmDescription)) {
            enc.dmDescription = enc.dmDescription.map(line => processText(line));
        } else if (typeof enc.dmDescription === 'string') {
            enc.dmDescription = [processText(enc.dmDescription)];
        }

        return enc;
    });

    // Check if we actually made changes (updatedCount logic was removed above, assuming all processed)
    fs.writeFileSync(filePath, JSON.stringify(encounters, null, 4), 'utf8');
    console.log(`Successfully integrated scaling mechanics with placeholders.`);

} catch (err) {
    console.error("Error:", err);
    process.exit(1);
}
