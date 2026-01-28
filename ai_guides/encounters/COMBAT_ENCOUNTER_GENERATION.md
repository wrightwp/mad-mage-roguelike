# Combat Encounter Generation Guide

This document provides guidelines for AI-assisted **Combat Encounter** generation following D&D 2024 rules, the `CombatEncounterData` interface, and the [Scaling Guide](file:///c:/Users/Willi/Repos/mad-mage-roguelike/src/types/SCALING_GUIDE.md).

## XP Budget System (D&D 2024)

Per-character XP thresholds by level. Combine these for the total party budget.

| Level | Low | Moderate | High | | Level | Low | Moderate | High |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | 50 | 75 | 100 | | **11** | 1,900 | 2,900 | 4,100 |
| **2** | 100 | 150 | 200 | | **12** | 2,200 | 3,700 | 4,700 |
| **3** | 150 | 225 | 400 | | **13** | 2,600 | 4,200 | 5,400 |
| **4** | 250 | 375 | 500 | | **14** | 2,900 | 4,900 | 6,200 |
| **5** | 500 | 750 | 1,100 | | **15** | 3,300 | 5,400 | 7,800 |
| **6** | 600 | 1,000 | 1,400 | | **16** | 3,800 | 6,100 | 9,800 |
| **7** | 750 | 1,300 | 1,700 | | **17** | 4,500 | 7,200 | 11,700 |
| **8** | 1,000 | 1,700 | 2,100 | | **18** | 5,000 | 8,700 | 14,200 |
| **9** | 1,300 | 2,000 | 2,600 | | **19** | 5,500 | 10,700 | 17,200 |
| **10** | 1,600 | 2,300 | 3,100 | | **20** | 6,400 | 13,200 | 22,000 |

**Total Budget** = (Per-Character XP for Level) × Number of Players.

> [!TIP]
> **NO MULTIPLIERS**: The 2024 rules **do not** use XP multipliers for multiple monsters. Simply sum the XP of all creatures.


---

## Encounter Design Rules

### Difficulty Classification (`difficulty`)
- **Low**: 1-2 scary moments; party wins with minimal resource loss. CR rating significantly below party level, or XP well under budget (`EncounterDifficulty.Low` / 'low').
- **Moderate**: Significant resource drain; requires healing or tactical use of class features. CR matches party level, XP near budget (`EncounterDifficulty.Moderate` / 'moderate').
- **High**: Dangerous/Lethal; requires smart tactics and good luck to avoid casualties. CR above party level, or XP at/exceeds budget (`EncounterDifficulty.High` / 'high').

## Important Rules

> [!CAUTION]
> **Never overwrite existing encounters** in `encounters.json` unless explicitly instructed. Always **append** new encounters to the existing list.

> [!IMPORTANT]
> Ensure the generated JSON strictly follows the `CombatEncounterData` interface defined in `src/types/EncounterData.ts`.


### Monster Selection
1. Use monsters from the same **thematic category** (e.g., all undead, all goblins, all beasts)
2. **Limit Stat Blocks**: Try to use only 2 or 3 unique stat blocks per encounter to keep combat manageable.
3. **Single Monster Guidelines** (for a party of 4):
    - **Low**: CR = 1/2 Party Level
    - **Moderate**: CR = Party Level
    - **High**: CR = Party Level + 50%
4. **Fragile Minions**: If using many creatures (more than 2 per character), ensure some have low HP/AC to avoid bogging down combat.
5. Consider terrain and lair interactions.

### Map Design (aiRoomPrompt)
- Size: 100ft to 400ft per side
- Always include 5ft grid squares
- **Interactive Terrain**: Incorporate elements that reward movement and positioning:
    - **Verticality**: Ledges, crates, balconies (encourage jumping/climbing).
    - **Defensive Spots**: Hard-to-reach cover for snipers.
    - **Hazards**: Pits, lava, or slippery surfaces that can be used offensively.
    - **Triggers**: Chandeliers to drop, barrels to explode, or levers to pull.
- Standard dungeon rooms: stone walls, dim lighting, debris.
- This prompt is used by an AI image generator to create the battle map.


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
- Allow scaling of DC checks for puzzles and traps.
- Scale based on the Tier of the encounter.
- Separate different elements of the dmDescription into a list format for easy readability.

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
