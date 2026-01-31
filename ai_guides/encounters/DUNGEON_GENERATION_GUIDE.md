# Dungeon Generation Guide

This guide explains how the dungeon generator selects and assigns encounters to nodes.

---

## Overview

When a dungeon is generated, the system:
1. Creates a layered node structure (entrance → layers → boss)
2. Assigns encounter types to nodes based on user configuration
3. Selects specific encounters from the library using multiple filters
4. Scales encounters to match the party's capabilities

---

## Encounter Selection Filters

The generator applies these filters **in order** when selecting encounters:

### 1. Tier Selection (by Party Level)

Encounters are organized into tiers based on D&D 5e play tiers:

| Tier | Party Levels | Encounter Source File |
|------|--------------|----------------------|
| 1    | 1-4          | `encounters-tier-1.json` |
| 2    | 5-10         | `encounters-tier-2.json` |
| 3    | 11-16        | `encounters-tier-3.json` |
| 4    | 17-20        | `encounters-tier-4.json` |

**The party level determines which tier file is used.** A level 3 party only sees Tier 1 encounters.

---

### 2. Encounter Type Matching

Each node has a type that maps to an encounter type:

| Node Type   | Encounter Type |
|-------------|----------------|
| Combat      | Combat         |
| Social      | Social         |
| Exploration | Exploration    |
| Rest        | Rest           |
| Treasure    | Treasure       |
| Boss        | Boss           |

Only encounters matching the node's type are considered.

---

### 3. XP Budget Range

Encounters must fall within an XP budget range based on the party's capabilities:

```
Minimum XP Budget = Party's Low Budget ÷ 2
Maximum XP Budget = Party's High Budget × 2
```

**Example: Level 3 Party of 4**
- Low Budget: 600 XP → **Min: 300 XP**
- High Budget: 1600 XP → **Max: 3200 XP**
- Valid encounter range: **300 - 3200 XP**

This ensures:
- Encounters aren't too weak (below half the low budget)
- Encounters can be scaled properly (within 2x the high budget)

#### XP Budget Tables by Level

| Level | Low | Moderate | High |
|-------|-----|----------|------|
| 1     | 50  | 75       | 100  |
| 2     | 100 | 150      | 200  |
| 3     | 150 | 225      | 400  |
| 4     | 250 | 375      | 500  |
| 5     | 500 | 750      | 1100 |
| 10    | 600 | 1000     | 1400 |
| 15    | 2000| 3000     | 4500 |
| 20    | 5500| 8250     | 13500|

*Values shown are per-character. Multiply by party size for total budget.*

---

### 4. Difficulty Filter (Optional)

For certain nodes (like Boss nodes), the generator may request a specific difficulty:
- **Low** - Easy encounters
- **Moderate** - Standard challenge
- **High** - Difficult encounters

---

### 5. Duplicate Prevention

The generator tracks which encounter names have been used on the current dungeon map. Each encounter can only appear **once per dungeon** to ensure variety.

---

## Encounter Scaling After Selection

Once an encounter is selected, it undergoes scaling to match the party:

### Combat Encounter Scaling

1. **XP Budget Calculation** - Target XP based on party size and level
2. **Monster Adjustment** - Add/remove monsters proportionally to hit target XP
3. **DC Scaling** - Skill check DCs adjusted for party level
4. **Reward Scaling** - Gold and XP rewards updated

### Non-Combat Encounter Scaling

- **DCs** adjusted based on party level
- **Trap damage** scaled appropriately
- **Treasure values** adjusted for party tier

---

## Node Distribution

The dungeon generator respects user-configured encounter counts:

| Encounter Type | Default Count | Notes |
|----------------|---------------|-------|
| Combat         | Variable      | Most common, fills remaining slots |
| Social         | 2-4           | NPCs, negotiations |
| Exploration    | 3-5           | Investigation, puzzles |
| Rest           | 2-3           | Safe areas for recovery |
| Treasure       | 2-4           | Loot rooms, trapped chests |
| Boss           | 1             | Always on final layer |

The actual distribution is set in the Floor Configuration modal before generation.

---

## Fallback Behavior

If no matching encounter is found after all filters:

1. **Default Encounters** - Generic placeholder encounters are used
2. **Boss Fallback** - If no Boss encounter exists, a High difficulty Combat encounter is used
3. **Empty Node** - If all else fails, node gets a generic description

---

## Related Guides

- [Combat Encounter Generation](./COMBAT_ENCOUNTER_GENERATION.md) - Detailed combat encounter rules
- [Scaling Guide](./SCALING_GUIDE.md) - How encounters scale to party level
- [AI Room Prompt Guide](./AI_ROOM_PROMPT_GUIDE.md) - Battle map generation prompts
