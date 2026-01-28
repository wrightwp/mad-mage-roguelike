---
name: generate_encounter
description: Generates a new EncounterData object (Combat, Social, etc.) following the project's strict rules, data sources, and the 2024 Dungeon Master's Guide, 2024 Players Handbook, and 2024 Monster Manual.
---

# Generate Encounter Skill

Use this skill when the user asks you to "create", "generate", or "make" an encounter (e.g., "Make a level 3 combat encounter").

## 1. Identify the Request
Determine the following from the user's prompt:
- **Type**: Combat, Social, Exploration, Rest, Treasure, or Boss.
- **Tier**: The Tier of play (1-4). If not given, infer from Level.
- **Level**: Target Party Level.
- **Party Size**: Number of characters (Default: 4).
- **Difficulty**: Low, Moderate, High, or Deadly.
- **Theme**: (Optional) e.g., "Undead", "Goblinoid", "Spooky".

## 2. Consult the Rules
You **MUST** read the specific generation guide for the requested type AND the scaling guide.
- Combat: `ai_guides/encounters/COMBAT_ENCOUNTER_GENERATION.md`
- Social: `ai_guides/encounters/SOCIAL_ENCOUNTER_GENERATION.md`
- Exploration: `ai_guides/encounters/EXPLORATION_ENCOUNTER_GENERATION.md`
- Rest: `ai_guides/encounters/REST_ENCOUNTER_GENERATION.md`
- Treasure: `ai_guides/encounters/TREASURE_ENCOUNTER_GENERATION.md`
- Boss: `ai_guides/encounters/BOSS_ENCOUNTER_GENERATION.md`
- **Scaling & Tiers**: `ai_guides/encounters/SCALING_GUIDE.md`

### Tier of Play Definitions:
- **Tier 1**: Levels 1-4
- **Tier 2**: Levels 5-10
- **Tier 3**: Levels 11-16
- **Tier 4**: Level 17+

### Generation Strategy:
- **Constraint 1**: **Max CR** per monster = **Party Level + 1**. Never exceed this.
- **Constraint 2**: Monsters must be appropriate for the requested **Tier**.
- **Step 1: Choose a Difficulty**: Low, Moderate, or High (see `COMBAT_ENCOUNTER_GENERATION.md` for definitions).
- **Step 2: Determine XP Budget**: Cros-reference Level and Difficulty in the XP Table to get the per-character budget, then multiply by Party Size.
- **Step 3: Spend Your Budget**: Select monsters by deducting their XP from the budget until it is close to 0. Mix and match creature types.
- Adjust **DCs** and **Damage** following the `SCALING_GUIDE.md`.

## 3. Select Monsters (If Combat/Boss)
Refer to **monsters.json**, the **2024 Monster Manual**, or the lists below.
- **Sum the XP**: Pick monsters so their total XP hits your Budget.
- **Mix CRs**: You can use many low-CR monsters or fewer high-CR ones.
- **Do not** invent stats. Use valid names and CRs/XP.

## 4. Construct the JSON
Generate a valid JSON object matching the `EncounterData` interface in `src/types/EncounterData.ts`.
- **CRITICAL**: Ensure all required fields for that specific `type` are present.
- **CRITICAL**: Ensure `aiRoomPrompt` is detailed and strictly visual (for image generation).

## 5. Final Output
Present the JSON code block to the user.
- If asking to "add" it to the game, you may use `write_to_file` to append it to `src/data/encounters-tier-1.json` (or the relevant tier file), but **ONLY** if specificially asked to "add" or "save" it. Otherwise, just show the JSON.
