# Encounter Generation Guide

This document provides guidelines for AI-assisted encounter generation following D&D 2024 rules.

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

### Difficulty Classification
- **Low**: CR rating significantly below party level, or XP well under budget
- **Moderate**: CR matches party level, XP near budget
- **High**: CR above party level, or XP at/exceeds budget

### Description Writing

**Room Description (Player-facing)**:
- What they see/hear/smell upon entering
- Visible creatures and their immediate reactions
- Notable environmental features
- Written in immersive, descriptive prose

**DM Description (DM-only)**:
- Hidden elements (traps, ambushes, secrets)
- Monster tactics and personality
- Alternative solutions to combat
- Treasure and reward locations
- Skill check DCs for interactions

### Win Conditions
Always consider alternatives to "kill all enemies":
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

## Example Encounter Template

```json
{
    "name": "Encounter Name",
    "level": 1,
    "type": "combat",
    "difficulty": "low|moderate|high",
    "xpBudget": 200,
    "monsters": [
        { "name": "Monster Name", "cr": 0.25, "exp": 50, "pb": 2, "mmLink": "url", "count": 4 }
    ],
    "attitude": "hostile|indifferent|friendly",
    "personality": "descriptor",
    "roomDescription": "Player-facing description...",
    "dmDescription": "DM-only information...",
    "size": 1,
    "winConditions": [
        { "condition": "Defeat all enemies", "reward": "Full XP" },
        { "condition": "Alternative method", "reward": "Partial reward" }
    ],
    "aiRoomPrompt": "VTT map generation prompt...",
    "lair": false
}
```
