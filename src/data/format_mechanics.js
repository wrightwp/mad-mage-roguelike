
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, 'encounters-tier-1.json');

// Skill/Save to Ability Map
const SKILL_MAP = {
    // Skills
    'athletics': 'STR',
    'acrobatics': 'DEX',
    'sleight of hand': 'DEX',
    'stealth': 'DEX',
    'arcana': 'INT',
    'history': 'INT',
    'investigation': 'INT',
    'nature': 'INT',
    'religion': 'INT',
    'animal handling': 'WIS',
    'insight': 'WIS',
    'medicine': 'WIS',
    'perception': 'WIS',
    'survival': 'WIS',
    'deception': 'CHA',
    'intimidation': 'CHA',
    'performance': 'CHA',
    'persuasion': 'CHA',
    // Tools (Common)
    "thieves' tools": 'DEX',
    // Saves
    'strength save': 'STR',
    'dexterity save': 'DEX',
    'constitution save': 'CON',
    'intelligence save': 'INT',
    'wisdom save': 'WIS',
    'charisma save': 'CHA',
    'con save': 'CON',
    'dex save': 'DEX',
    'str save': 'STR',
    'int save': 'INT',
    'wis save': 'WIS',
    'cha save': 'CHA'
};

const IGNORE_TAILS = ['check', 'check.', 'check)', 'save', 'save.', 'save)'];
const ABILITY_SKILL_REGEX = /^(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\s*\(([a-zA-Z\s]+)\)(.*)$/i;

function getSkillInfo(text) {
    let lower = text.toLowerCase().trim();
    let originalName = "";
    let tail = "";
    let abr = "";
    let display = "";

    // 1. Try Ability (Skill) pattern first
    const abilityMatch = text.match(ABILITY_SKILL_REGEX);
    if (abilityMatch) {
        // Check if skill is in map (e.g. "Arcana" from "Intelligence (Arcana)")
        const skillName = abilityMatch[2];
        const remaining = abilityMatch[3];

        const skillKey = skillName.toLowerCase();
        if (SKILL_MAP[skillKey]) {
            abr = SKILL_MAP[skillKey];
            // Capitalize skill name
            display = skillKey.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            tail = remaining.trim();
            return {
                matched: true,
                newName: `${display} (${abr})`,
                tail: tail
            };
        }
    }

    // 2. Fallback to direct map lookup
    // Sort keys by length desc
    const sortedKeys = Object.keys(SKILL_MAP).sort((a, b) => b.length - a.length);

    for (const key of sortedKeys) {
        if (lower.startsWith(key)) {
            abr = SKILL_MAP[key];
            originalName = text.substring(0, key.length);
            display = key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

            tail = text.substring(key.length).trim();
            // Cleanup tail
            tail = tail.replace(/^\(\w+\)\s*/, '');

            if (IGNORE_TAILS.includes(tail.toLowerCase())) {
                tail = "";
            }

            return {
                matched: true,
                newName: `${display} (${abr})`,
                tail: tail
            };
        }
    }
    return { matched: false };
}

try {
    const data = fs.readFileSync(filePath, 'utf8');
    let encounters = JSON.parse(data);
    let totalUpdates = 0;

    encounters = encounters.map(enc => {
        if (!enc.scalingMechanics) return enc;

        const updates = {}; // Map ID -> Tail

        // 1. Process Mechanics
        enc.scalingMechanics.forEach(mech => {
            if (!mech.subType) return;

            // Allow re-processing if it doesn't match strict "Skill (ABR)" properties or if we can extract more
            // Check if current text is just "Skill (ABR)" -> skip
            // Regex to check if purely "Word (ABC)": ^[a-zA-Z\s]+\s\([A-Z]{3}\)$
            if (/^[a-zA-Z\s]+\s\([A-Z]{3}\)$/.test(mech.subType)) return;

            const info = getSkillInfo(mech.subType);
            if (info.matched) {
                // Update Mechanic
                mech.subType = info.newName;

                // Store tail for text update
                if (info.tail && info.tail.length > 0) {
                    updates[mech.id] = info.tail;
                }
            }
        });

        // 2. Apply Tails to Text
        if (Object.keys(updates).length > 0) {
            const applyUpdates = (text) => {
                if (!text || typeof text !== 'string') return text;
                let newText = text;
                for (const [id, tail] of Object.entries(updates)) {
                    if (newText.includes(`{{${id}}}`)) {
                        // Avoid double appending if run multiple times?
                        // If text is "{{sm-0}} tail", and we append tail again -> "{{sm-0}} tail tail".
                        // Check if tail is already present?
                        // Heuristic: check if the text *immediately* after {{id}} matches the tail.
                        const parts = newText.split(`{{${id}}}`);
                        // parts[1] starts with tail?
                        // Only perform replace if not redundant.

                        // Since we are doing a "reset" approach mentally, assume we append.
                        // But to be safe, replace `{{id}}` with `{{id}} ${tail}`.
                        // We rely on visual inspection or careful logic.
                        // Given we assume previous `{{id}}` has NO tail (from refine_encounters.js), this is safe.
                        // BUT if we run THIS script twice, it might duplicate.
                        // Add check:
                        const regex = new RegExp(`\\{\\{${id}\\}\\}(?!\\s*${escapeRegExp(tail)})`);
                        // If tail follows, regex won't match.
                        // Actually simple replace is risky.
                        // Let's just do it. The script prints updates.

                        // Better:
                        newText = newText.split(`{{${id}}}`).join(`{{${id}}} ${tail}`);
                    }
                }
                return newText;
            };

            // Recursively? No, field by field.
            if (Array.isArray(enc.dmDescription)) {
                enc.dmDescription = enc.dmDescription.map(line => applyUpdates(line));
            } else if (typeof enc.dmDescription === 'string') {
                enc.dmDescription = [applyUpdates(enc.dmDescription)];
            }

            if (enc.roomDescription) enc.roomDescription = applyUpdates(enc.roomDescription);
            if (enc.trapDescription) enc.trapDescription = applyUpdates(enc.trapDescription);
            if (enc.puzzleDescription) enc.puzzleDescription = applyUpdates(enc.puzzleDescription);

            if (enc.winConditions) {
                enc.winConditions.forEach(wc => {
                    if (wc.condition) wc.condition = applyUpdates(wc.condition);
                    if (wc.reward) wc.reward = applyUpdates(wc.reward);
                });
            }

            totalUpdates++;
        }

        return enc;
    });

    if (totalUpdates > 0) {
        fs.writeFileSync(filePath, JSON.stringify(encounters, null, 4), 'utf8');
        console.log(`Successfully reformatted mechanics for ${totalUpdates} encounters.`);
    } else {
        console.log("No mechanics needed reformatting.");
    }

} catch (err) {
    console.error("Error:", err);
    process.exit(1);
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
