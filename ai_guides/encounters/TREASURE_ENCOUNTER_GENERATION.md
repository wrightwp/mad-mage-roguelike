# Treasure Encounter Generation Guide

This document provides guidelines for AI-assisted **Treasure Encounter** generation. These encounters focus on loot, potential hazards (traps/mimics), and the thrill of discovery.

## Core Concepts

Treasure encounters are rewards for exploration but should always carry a sense of mystery or risk. They are not just lists of items; they are rooms with atmosphere.

---

## Encounter Design Rules

### Atmosphere (`roomDescription`, `dmDescription`)
- **Theme**: Vaults, armories, forgotten shrines, hidden alcoves, debris-filled storerooms.
- **Sensory Details**: The glint of gold, dust motes in a single beam of light, the smell of ozone (magic) or rot (mimic).

### Loot (`items`, `goldValue`)
- **Appropriate Reward**: Loot should match the floor level/CR.
- **Variety**: Mix coins (`goldValue`) with interesting items (`items`).
- **Curiosity**: Include "trash" items that add flavor (e.g., "A silver locket with a faded portrait").

### Risks (`hasTrap`, `isLocked`, `isMimic`)
- **Locks**: require Thieves' Tools or Strength to bypass.
- **Traps**: protect the goods. Poison needles, collapsing ceilings, or magical wards.
- **Mimics**: The ultimate "Treasure" encounter twist. If `isMimic` is true, the chest/object *is* the monster.

**Scaling Mechanics (`scalingMechanics`)**:
- Use this array for `lockDC` (if you want generic scaling) and Trap DCs.
- Example: `{ "type": "trap", "subType": "Poison Needle", "dc": 15, "damage": "1d4" }`.

---

## Example Treasure Encounter Template

```json
{
    "name": "The Gilded Cage",
    "level": 2,
    "type": "treasure",
    "difficulty": "hard",
    "xpBudget": 450,
    "roomDescription": "A small, circular room with a domed ceiling painted to look like the night sky. In the center, bathed in magical light, sits a heavy chest reinforced with bands of blue steel.",
    "dmDescription": [
        "The chest is locked (DC 15) and trapped.",
        "The floor tiles around it are pressure sensitive."
    ],
    "size": 1,
    "items": [
        "Potion of Greater Healing",
        "Scroll of Misty Step",
        "Gem-encrusted goblet (worth 50gp)"
    ],
    "goldValue": 250,
    "hasTrap": true,
    "trapDescription": "Pressure plates trigger a cloud of sleeping gas (Constitution Save DC 13 or sleep for 1 minute).",
    "isLocked": true,
    "lockDC": 15,
    "isMimic": false,
    "scalingMechanics": [
        { "type": "trap", "subType": "Sleeping Gas (Con Save)", "dc": 13 },
        { "type": "skill", "subType": "Thieves Tools (Lock)", "dc": 15 }
    ],
    "winConditions": [
        { "condition": "Loot the chest", "reward": "Gain Items + XP", "xpReward": 50 }
    ],
    "aiRoomPrompt": "Small circular vault, starry ceiling, magical spotlight on a blue steel chest, pristine condition",
    "lair": false
}
```

### Mimic Example

```json
{
    "name": "Greed's End",
    "level": 3,
    "type": "treasure",
    "difficulty": "deadly",
    "xpBudget": 700,
    "roomDescription": "This damp alcove contains a single, magnificent wooden chest with golden latches. It looks almost too clean compared to the surrounding rubble.",
    "dmDescription": ["The chest is a Mimic. It waits for touch."],
    "size": 1,
    "items": [" chewed remnants of leather armor", "300 gp inside the creature's gullet"],
    "goldValue": 300,
    "hasTrap": false,
    "isLocked": false,
    "isMimic": true,
    "winConditions": [
        { "condition": "Defeat the Mimic", "reward": "Loot + XP", "xpReward": 700 },
        { "condition": "Recognize and avoid", "reward": "Survival, but no loot", "xpReward": 100 }
    ],
    "aiRoomPrompt": "Damp alcove, rubble everywhere, one pristine golden chest in the center, ominous silence",
    "lair": false
}
```
