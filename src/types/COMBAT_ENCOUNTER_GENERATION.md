# Combat Encounter Generation Guide

This document provides guidelines for AI-assisted **Combat Encounter** generation following D&D 2024 rules and the `CombatEncounterData` interface.

## XP Budget System (D&D 2024)

Per-character XP thresholds by level:

| Level | Low | Moderate | High |
|-------|-----|----------|------|
| 1     | 50  | 75       | 100  |
| 2     | 100 | 150      | 200  |
| 3     | 150 | 225      | 400  |

**Total Budget** = Per-Character XP × Number of Players

For a party of 4 Level 1 characters:
- **Low**: 200 XP (safe, may need some healing)
- **Moderate**: 300 XP (challenging, slim chance of death)
- **High**: 400 XP (deadly, requires good tactics)

---

## Important Rules

> [!CAUTION]
> **Never overwrite existing encounters** in `encounters.json` unless explicitly instructed. Always **append** new encounters to the existing list.

> [!IMPORTANT]
> Ensure the generated JSON strictly follows the `CombatEncounterData` interface defined in `src/types/EncounterData.ts`.

---

## Encounter Design Rules

### Monster Selection
1. Use monsters from the same **thematic category** (e.g., all undead, all goblins, all beasts)
2. Mix leader/elite types with minions when appropriate
3. Consider terrain and lair interactions

### Map Design (aiRoomPrompt)
- Size: 100ft to 400ft per side
- Always include 5ft grid squares
- Standard dungeon rooms: stone walls, dim lighting, debris
- Unique rooms: lava fields, crevasses, geodes, flooded chambers, etc.
- This prompt is used by an AI image generator to create the battle map.

### Difficulty Classification (`difficulty`)
- **Low**: CR rating significantly below party level, or XP well under budget (`EncounterDifficulty.Low` / 'low')
- **Moderate**: CR matches party level, XP near budget (`EncounterDifficulty.Moderate` / 'moderate')
- **High**: CR above party level, or XP at/exceeds budget (`EncounterDifficulty.High` / 'high')

### Description Writing

**Room Description (`roomDescription`)**:
- Player-facing description.
- What they see/hear/smell upon entering.
- Visible creatures and their immediate reactions.
- Notable environmental features.
- Written in immersive, descriptive prose.

**DM Description (`dmDescription`)**:
- DM-only information.
- Hidden elements (traps, ambushes, secrets).
- Monster tactics and personality.
- Alternative solutions to combat.
- Treasure and reward locations.

### Combat Specifics
- **Attitude** (`attitude`):
    - `hostile`: Aggressive, will attack on sight.
    - `indifferent`: Wary, might be persuaded or bribed.
    - `friendly`: Unlikely to attack unless provoked.
- **Personality** (`personality`): Short descriptor of the monsters' behavior (e.g., "cowardly", "greedy", "boastful").

### Win Conditions (`winConditions`)
Optional. Always consider alternatives to "kill all enemies":
- Negotiate, bribe, or intimidate
- Sneak past
- Disable a specific objective
- Rescue a hostage
- Survive for X rounds

---

## Monster Categories

### Undead
- Crawling Claw (CR 0, 10 XP)
- Skeleton (CR 1/4, 50 XP)
- Zombie (CR 1/4, 50 XP)

### Goblins
- Goblin Minion (CR 1/8, 25 XP)
- Goblin (CR 1/4, 50 XP)
- Goblin Warrior (CR 1/4, 50 XP)

### Kobolds
- Kobold (CR 1/8, 25 XP)
- Kobold Warrior (CR 1/8, 25 XP)
- Winged Kobold (CR 1/4, 50 XP)

### Beasts/Vermin
- Giant Rat (CR 1/8, 25 XP)
- Giant Centipede (CR 1/4, 50 XP)
- Giant Wolf Spider (CR 1/4, 50 XP)
- Swarm of Rats (CR 1/4, 50 XP)

### Humanoids
- Bandit (CR 1/8, 25 XP)
- Cultist (CR 1/8, 25 XP)
- Guard (CR 1/8, 25 XP)

### Aberrations/Other
- Stirge (CR 1/8, 25 XP)
- Darkmantle (CR 1/2, 100 XP)

---

## Example Combat Encounter Template

```json
{
    "name": "Goblin Ambush",
    "level": 1,
    "type": "combat",
    "difficulty": "moderate",
    "xpBudget": 200,
    "monsters": [
        { "name": "Goblin", "cr": 0.25, "exp": 50, "pb": 2, "mmLink": "url", "count": 2 },
        { "name": "Goblin Minion", "cr": 0.125, "exp": 25, "pb": 2, "mmLink": "url", "count": 4 }
    ],
    "attitude": "hostile",
    "personality": "sneaky",
    "roomDescription": "You enter a damp, echoing chamber. Shadows dance on the walls as torchlight flickers from a makeshift camp in the corner. Suddenly, shrill cackles erupt from behind the stalagmites!",
    "dmDescription": "The goblins are hiding (Stealth +6) and will attempt to surprise the party. They have a primitive trap set near the entrance (DC 12 Perception to spot).",
    "size": 1,
    "winConditions": [
        { "condition": "Defeat all enemies", "reward": "Full XP" },
        { "condition": "Intimidate the leader", "reward": "Full XP" }
    ],
    "aiRoomPrompt": "D&D battle map, damp cave chamber, stalagmites, dim torchlight, goblins hiding, 5ft grid, top down view",
    "lair": false
}
```
