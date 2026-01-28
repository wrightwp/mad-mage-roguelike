# Rest Encounter Generation Guide

This document provides guidelines for AI-assisted **Rest Encounter** generation following D&D 2024 rules and the `RestEncounterData` interface.

## Core Concepts

Rest encounters provide a moment of respite in the dangerous dungeon. They focus on **Safety**, **Atmosphere**, and **Recovery**. In a roguelike dungeon, these safe havens are precious.

---

## Important Rules

> [!IMPORTANT]
> **SHORT RESTS ONLY.**
> - The dungeon is too dangerous for a full 8-hour Long Rest.
> - Rest encounters allow players to spend Hit Dice, regain some class features/spell slots (depending on class), and catch their breath for 1 hour.

---

## Encounter Design Rules

### Atmosphere and Description (`roomDescription`)
- **Contrast**: These rooms should feel distinctly different from the cold, damp dungeon.
- **Cozy & Serene**: Use words like "safe", "warm", "peaceful", "dry", "fragrant".
- **Visuals**: A crackling hearth, soft mossy beds, a shaft of pure sunlight, a bubbling fountain of clear water.

### Shelter Quality (`shelterQuality`)
- **Poor**: Better than the hallway, but barely. A dry corner behind a barricade.
- **Good**: A proper room with a lockable door, possibly some old furniture.
- **Secure**: Impregnable. A magical sanctuary, a hidden shrine, or a fortified bunker.

### Healing Bonus (`healingBonus`)
- **True**: The area is blessed or exceptionally comfortable. Players regain extra HP (e.g., max die roll or +1d4) when spending Hit Dice.
- **False**: Standard rest rules apply.

### DM Description (`dmDescription`)
- **Format**: `string[]` (list of bullet points).
- Note any restrictions (e.g., "The magic barrier fades after 1 hour").
- Mention if the room has any one-time use boons (e.g., "The fountain restores one 1st-level spell slot").

---

## Example Rest Encounter Template

```json
{
    "name": "The Hidden Shrine",
    "level": 1,
    "type": "rest",
    "difficulty": "low", // Rest encounters are usually low 'difficulty' as they are rewards
    "roomDescription": "You slip through the crack in the wall and find a small, circular chamber. The air here smells of lavender and roasted nuts. A warm, golden light radiates from a crystal embedded in the ceiling, and piles of soft furs are arranged around a small, smokeless fire.",
    "dmDescription": [
        "A Sanctuary spell protects this room.",
        "It cannot be entered by Undead.",
        "The fire never goes out."
    ],
    "shelterQuality": "secure",
    "healingBonus": true,
    "size": 1,
    "aiRoomPrompt": "Cozy warm stone chamber, soft furs, magic crystal light, smokeless fire, lavender tint, safe haven",
    "lair": false
}
```
