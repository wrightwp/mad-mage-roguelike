# Exploration Encounter Generation Guide

This document provides guidelines for AI-assisted **Exploration Encounter** generation following D&D 2024 rules, the `ExplorationEncounterData` interface, and the [Scaling Guide](file:///c:/Users/Willi/Repos/mad-mage-roguelike/src/types/SCALING_GUIDE.md).

## Core Concepts

Exploration encounters focus on the **Environment**, **Discovery**, and **Hazards**. They challenge the party's perception, survival skills, and physical traversal abilities.

---

## Encounter Design Rules

### Puzzle Elements (Optional)
Exploration encounters can optionally include **puzzle-style elements**. If present, include:
- **puzzleDescription**: Clear mechanics and constraints the players can observe.
- **dc**: Primary check DC if applicable.
- **solution**: The intended solution for the DM.
- **penalty**: Consequence for failure, if any.

### Environment and Traps (`traps`)
- **Interactive Terrain**: D&D 2024 emphasizes environments that reward movement and positioning.
    - **Verticality**: Elevation changes (ledges, balconies) that reward climbing or flight.
    - **Dynamic Elements**: Things that change state, like a bridge that can be cut or a lever that opens a sluice gate.
    - **Strategic Hazards**: Environmental dangers (e.g., slippery ice, toxic spores) that both PCs and NPCs can use strategically.
- **Hazards**: Natural dangers like slippery moss, lava flows, or toxic spores.
**Scaling Mechanics (`scalingMechanics`)**:
- **Format**: An array of objects.
- **Fields**:
    - `type`: 'trap', 'hazard', 'puzzle', 'other'.
    - `subType`: (Optional) String detail (e.g. "Perception", "Constitution Save").
    - `dc`: (Optional) Number. The difficulty class.
    - `damage`: (Optional) String. The damage dice (e.g. "2d6").
- **Example**:
    ```json
    "scalingMechanics": [
        { "type": "trap", "subType": "Spore Cloud", "dc": 12, "damage": "1d6" },
        { "type": "puzzle", "subType": "Glyph Decipher", "dc": 14 }
    ]
    ```
- *Usage*: Use this for ANY numerical difficulty requiring scaling. Do not bury numbers in text.

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
    "dmDescription": [
        "The fungi are Violet Fungi (hazards, not monsters here).",
        "Disturbing them releases toxic spores."
    ],
    "traps": [
        "Spore Cloud: Triggered by loud noise or touching the fungi.",
        "False Floor (Pit Trap): 10ft drop."
    ],
    "scalingMechanics": [
        { "type": "hazard", "subType": "Spore Cloud (Con Save)", "dc": 12, "damage": "1d6" },
        { "type": "trap", "subType": "False Floor (Perception)", "dc": 14, "damage": "1d6" }
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
