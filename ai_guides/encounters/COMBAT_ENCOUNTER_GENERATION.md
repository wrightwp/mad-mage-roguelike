# Combat Encounter Generation Guide

This document provides guidelines for AI-assisted **Combat Encounter** generation following D&D 2024 rules, the `CombatEncounterData` interface, and the [Scaling Guide](file:///c:/Users/Willi/Repos/mad-mage-roguelike/src/types/SCALING_GUIDE.md).

## XP Budget System (D&D 2024)

Per-character XP thresholds by level. Combine these for the total party budget.

## XP Budget per Character (2024 Rules)

| Party’s Level | Low | Moderate | High | | Party’s Level | Low | Moderate | High |
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

**Step 2: Determine Your XP Budget.** Using the XP Budget per Character table, cross-reference the party’s level with the desired encounter difficulty. Multiply the number in the table by the number of characters in the party to get your XP budget for the encounter.

> [!TIP]
> **NO MULTIPLIERS**: The 2024 rules **do not** use XP multipliers for multiple monsters. Simply sum the XP of all creatures.
>
> **XP IS THE TARGET**: Use the XP budget as your primary goal. Challenge Rating (CR) is a limit, not a target.


---

## Encounter Design Rules

### Step 1: Choose a Difficulty (`difficulty`)

- **Low Difficulty**: An encounter of low difficulty is likely to have one or two scary moments for the players, but their characters should emerge victorious with no casualties. One or more of them might need to use healing resources, however. As a rough guideline, a single monster generally presents a low-difficulty challenge for a party of four characters whose level equals the monster’s CR.

- **Moderate Difficulty**: Absent healing and other resources, an encounter of moderate difficulty could go badly for the adventurers. Weaker characters might get taken out of the fight, and there’s a slim chance that one or more characters might die.

- **High Difficulty**: A high-difficulty encounter could be lethal for one or more characters. To survive it, the characters will need smart tactics, quick thinking, and maybe even a little luck.

## Important Rules

> [!CAUTION]
> **Never overwrite existing encounters** in `encounters.json` unless explicitly instructed. Always **append** new encounters to the existing list.

> [!IMPORTANT]
> Ensure the generated JSON strictly follows the `CombatEncounterData` interface defined in `src/types/EncounterData.ts`.


### Step 3: Spend Your Budget

Every creature has an XP value in its stat block. When you add a creature to your combat encounter, deduct its XP from your XP budget to determine how many XP you have left to spend. Spend as much of your XP budget as you can without going over. It’s OK if you have a few unspent XP left over.

**Example 1**: A low-difficulty encounter for four level 1 characters has an XP budget of 50 × 4, for a total of 200 XP. With that, you could build any of the following encounters:
- 1 Bugbear Warrior (200 XP)
- 2 Giant Wasps (100 XP each), for 200 XP total
- 6 Twig Blights (25 XP each), for 150 XP total

---

### Troubleshooting

When creating and running combat encounters, keep the following in mind.

**Many Creatures**: The more creatures in an encounter, the higher the risk that a lucky streak on their part could deal more damage to the characters than you expect. If your encounter includes more than two creatures per character, include fragile creatures that can be defeated quickly. This guideline is especially important for characters of level 1 or 2.

**Adjustments**: A player’s absence might warrant removing creatures from an encounter to keep it at the intended difficulty. Also, die rolls and other factors can result in an encounter being easier or harder than intended. You can adjust an encounter on the fly, such as by having creatures flee (making the encounter easier) or adding reinforcements (making the encounter harder).

**CR 0 Creatures**: Creatures that have a CR of 0, particularly ones that are worth 0 XP, should be used sparingly. If you want to include many CR 0 critters in an encounter, use swarms from the Monster Manual instead.

**Number of Stat Blocks**: The best combat encounters often pair one kind of creature with another, such as fire giants paired with hell hounds. Be mindful of the number of stat blocks you need to run the encounter. Referencing more than two or three stat blocks for a single encounter can be daunting, particularly if the creatures are complex.

**Powerful Creatures**: If your combat encounter includes a creature whose CR is higher than the party’s level, be aware that such a creature might deal enough damage with a single action to take out one or more characters. For example, an Ogre (CR 2) can kill a level 1 Wizard with a single blow.

**Unusual Features**: If a monster has a feature that lower-level characters can’t easily overcome, consider not adding that monster to an encounter for characters whose level is lower than the monster’s Challenge Rating.

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

> [!NOTE]
> **Example List Only**: The following lists are **examples** of valid monsters found in the database.
> You are free to use **ANY valid D&D 5e 2024** monster, even if not listed below, provided you use accurate stats (CR, XP) from the 2024 Monster Manual.

### Humanoid
- Bandit (CR 1/8, 25 XP)
- Cultist (CR 1/8, 25 XP)
- Guard (CR 1/8, 25 XP)
- Kobold (CR 1/8, 25 XP)
- Acolyte (CR 1/4, 50 XP)
- Drow (CR 1/4, 50 XP)
- Goblin (CR 1/4, 50 XP)

### Undead
- Crawling Claw (CR 0, 10 XP)
- Skeleton (CR 1/4, 50 XP)
- Zombie (CR 1/4, 50 XP)

### Beast
- Baboon (CR 0, 10 XP)
- Giant Fire Beetle (CR 0, 10 XP)
- Blood Hawk (CR 1/8, 25 XP)
- Giant Rat (CR 1/8, 25 XP)
- Giant Wolf Spider (CR 1/4, 50 XP)
- Constrictor Snake (CR 1/4, 50 XP)

### Construct
- Homunculus (CR 0, 10 XP)
- Modron Monodrone (CR 1/8, 25 XP)
- Animated Armor (CR 1, 200 XP)

### Elemental
- Mud Mephit (CR 1/4, 50 XP)
- Magmin (CR 1/2, 100 XP)

### Fey
- Goblin Minion (CR 1/8, 25 XP)
- Blink Dog (CR 1/4, 50 XP)
- Pixie (CR 1/4, 50 XP)

### Fiend
- Larva (CR 0, 10 XP)
- Lemure (CR 0, 10 XP)
- Manes (CR 1/8, 25 XP)
- Dretch (CR 1/4, 50 XP)

### Plant
- Awakened Shrub (CR 0, 10 XP)
- Twig Blight (CR 1/8, 25 XP)
- Needle Blight (CR 1/4, 50 XP)

### Aberration
- Flumph (CR 1/8, 25 XP)
- Slaad Tadpole (CR 1/8, 25 XP)
- Star Spawn Grue (CR 1/4, 50 XP)

### Monstrosity
- Flying Snake (CR 1/8, 25 XP)
- Stirge (CR 1/8, 25 XP)
- Cockatrice (CR 1/2, 100 XP)
- Darkmantle (CR 1/2, 100 XP)

### Dragon
- Kobold Warrior (CR 1/8, 25 XP)
- PseudoDragon (CR 1/4, 50 XP)
- Ambush Drake (CR 1/2, 100 XP)

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
