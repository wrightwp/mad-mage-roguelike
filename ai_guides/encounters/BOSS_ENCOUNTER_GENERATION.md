# Boss Encounter Generation Guide


This document provides guidelines for AI-assisted **Boss Encounter** generation following D&D 2024 rules and the `BossEncounterData` interface.

## Troubleshooting (Boss Editions)
**Powerful Creatures**: If your combat encounter includes a creature whose CR is higher than the party’s level, be aware that such a creature might deal enough damage with a single action to take out one or more characters.
**Unusual Features**: If a monster has a feature that lower-level characters can’t easily overcome, consider not adding that monster to an encounter for characters whose level is lower than the monster’s Challenge Rating.

## Core Concepts

Boss encounters are the climax of a dungeon floor or quest line. They feature **Legendary Enemies**, **Dynamic Phases**, and **High Stakes**.

---

## Important Rules

> [!CAUTION]
> **BOSSES ARE DEADLY.**
> - The XP Budget for a boss should be calculated as a **Deadly** encounter or higher.
> - Bosses often break the standard rules of action economy (using Legendary Actions).

---

## Encounter Design Rules

### Legendary Actions (`legendaryActions`)
- Powerful off-turn abilities that keep the boss dynamic.
- Examples:
  - "Move up to half speed without provoking attacks."
  - "Make one melee attack."
  - "Cast a cantrip."
  - "Unleash a local burst of energy (Cost 2 actions)."

### Lair Actions (`lairActions`)
- Environmental effects that occur at Initiative count 20.
- Examples:
  - "Magical darkness fills a 20ft radius."
  - "Stalagmites fall from the ceiling (Dex save)."
  - "The floor becomes difficult terrain."

### Phases (`phases`)
- Optional mechanics that change the fight dynamics as the boss takes damage.
- **Trigger**: Usually HP thresholds (e.g., "At 50% HP") or round counts.
- **Effect**:
  - Change in behavior (Aggressive -> Defensive).
  - New abilities unlocked.
  - Environment change (Lava rises, pillars collapse).
  - Transformation (Polymorphs into a dragon).

### Atmosphere (`roomDescription`)
- The arena should be memorable and interactive.
- Grand architecture, ominious lighting, or a bizarre magical anomaly.

---

## Example Boss Encounter Template

```json
{
    "name": "Xar'Kala, the Void Seer",
    "level": 3,
    "type": "boss",
    "difficulty": "deadly", // Bosses are always High/Deadly
    "xpBudget": 800,
    "monsters": [
        { "name": "Xar'Kala", "cr": 3, "exp": 700, "pb": 2, "mmLink": "url", "count": 1 },
        { "name": "Void Wisp", "cr": 0.25, "exp": 50, "pb": 2, "mmLink": "url", "count": 2 }
    ],
    "attitude": "hostile",
    "personality": "Arrogant, speaks in riddles, believes they are a god.",
    "roomDescription": "A massive circular chamber with a floor of obsidian glass. Beneath the glass, a swirling purple galaxy churns. In the center, a throne of floating crystals hovers 10 feet in the air.",
    "dmDescription": "The floor is slippery (Acrobatics DC 10 to run). Wisps explode on death.",
    "legendaryActions": [
        "Teleport: Xar'Kala teleports up to 30ft.",
        "Void Bolt: Ranged Spell Attack +5, 1d10 Force damage."
    ],
    "lairActions": [
        "Gravity Shift: All creatures must succeed on a DC 13 Str save or be pulled 10ft toward the center."
    ],
    "phases": [
        {
            "name": "Shattered Throne",
            "trigger": "At 50% HP",
            "description": "Xar'Kala smashes the crystal throne. Shards litter the floor (Difficult Terrain). They gain resistance to magical damage for 1 round."
        }
    ],
    "size": 1,
    "aiRoomPrompt": "circular obsidian arena, purple galaxy underneath floor, floating crystal throne, cosmic horror atmosphere",
    "lair": true
}
```
