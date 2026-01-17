# Exploration Encounter Generation Guide

This document provides guidelines for AI-assisted **Exploration Encounter** generation following D&D 2024 rules and the `ExplorationEncounterData` interface.

## Core Concepts

Exploration encounters focus on the **Environment**, **Discovery**, and **Hazards**. They challenge the party's perception, survival skills, and physical traversal abilities.

---

## Encounter Design Rules

### Environment and Traps (`traps`)
- **Hazards**: Natural dangers like slippery moss, lava flows, or toxic spores.
- **Traps**: Constructed dangers. Always include:
  - **Trigger**: What sets it off (e.g., pressure plate, tripwire).
  - **Effect**: Damage or condition (e.g., 2d6 Fire damage, Restrained).
  - **Countermeasures**: DC to spot (Perception/Investigation) and DC to disarm (Sleight of Hand/Thieves' Tools).

### Secrets and Loot (`secretDoors`, `items`)
- **Secret Doors**: Hidden passages leading to treasure or shortcuts. Define the DC to find them.
- **Items**: Interesting loot found in the environment.
  - Mundane gear (rope, rations).
  - Trinkets or curiosities.
  - Minor magic items (potions, scrolls).

### XP Rewards (`xpBudget`)
- Award XP for overcoming hazards or finding secrets.
- Finding a well-hidden secret room can be worth as much as a small combat encounter.

---

## Example Exploration Encounter Template

```json
{
    "name": "The Spore Corridor",
    "level": 1,
    "type": "exploration",
    "difficulty": "moderate",
    "xpBudget": 150,
    "roomDescription": "The air in this long hallway is thick with yellow dust. Strange, bulbous fungi line the walls, pulsing slowly. A wooden chest sits at the far end.",
    "dmDescription": "The fungi are Violet Fungi (hazards, not monsters here). Disturbing them releases toxic spores.",
    "traps": [
        "Spore Cloud: Triggered by loud noise or touching the fungi. Effect: DC 12 Con save or 1d6 Poison damage and Poisoned for 1 hour.",
        "False Floor (Pit Trap): DC 14 Perception to spot. 10ft drop (1d6 bludgeoning)."
    ],
    "items": ["Potion of Healing", "Gold Ring (25gp)", "Dwarven Helm"],
    "secretDoors": true,
    "size": 2,
    "winConditions": [
        { "condition": "Cross the corridor safely", "reward": "50 XP" },
        { "condition": "Retrieve the chest loot", "reward": "100 XP + Items" }
    ],
    "aiRoomPrompt": "Dungeon corridor, bioluminescent fungi, dusty atmosphere, wooden chest in distance, top down view",
    "lair": false
}
```
