# Social Encounter Generation Guide

This document provides guidelines for AI-assisted **Social Encounter** generation following D&D 2024 rules, the `SocialEncounterData` interface, and the [Scaling Guide](file:///c:/Users/Willi/Repos/mad-mage-roguelike/src/types/SCALING_GUIDE.md).

## Core Concepts

Social encounters focus on **Interaction**, **NPCs**, and **Roleplay**. The party must navigate conversations, negotiations, or deceptions to achieve their goals.

---

## Important Rules

> [!IMPORTANT]
> **XP IS FOR TALKING, NOT FIGHTING.**
> - **Social Resolution**: Award the full XP budget if the players successfully resolve the encounter through social means (persuasion, intimidation, deception, trade, etc.).
> - **Combat Resolution**: Award **0 XP** if the players choose to kill the NPCs. This discourages "murder-hobo" behavior in social situations.

---

## Encounter Design Rules

### Interaction Types
- **Information Gathering**: Learning about dungeon secrets, safe paths, or lore.
- **Negotiation**: Bargaining for safe passage, resources, or assistance.
- **Deception**: Tricking guards, cultists, or rivals.
- **Quest Hooks**: Receiving a task or objective (`questHook`).

### Attitude (`attitude`)
Define the starting disposition of the NPCs. You can use a **1d12 roll** to determine this:
- **Hostile** (1-4): Aggressive but willing to talk first. Might demand a toll or surrender.
- **Indifferent** (5-8): Neutral, business-like, or wary. Needs convincing.
- **Friendly** (9-12): Helpful, willing to chat. Good for merchants or rescued prisoners.

> [!TIP]
> Modify the result based on creature type (e.g., predators +2 to hostility) or circumstances.

### Personality (`personality`)
A short, evocative descriptor to guide roleplay (e.g., "nervous and twitchy", "arrogant noble", "grumpy merchant").

### Rewards (`xpBudget` & `tradeGoods`)
- **XP**: Set a budget appropriate for the difficulty of the social challenge.
- **Trade Goods**: Optional list of items available for barter or purchase if the NPC is a merchant.

---

## Example Social Encounter Template

```json
{
    "name": "Lost Kobold Merchant",
    "level": 1,
    "type": "social",
    "difficulty": "low",
    "xpBudget": 100,
    "monsters": [
        { "name": "Kobold Commoner", "cr": 0, "exp": 10, "pb": 2, "mmLink": "url", "count": 1 }
    ],
    "attitude": "indifferent",
    "personality": "Obsessed with shiny rocks, skittish",
    "roomDescription": "A small campfire flickers in the center of the room. A small, reptilian figure is sorting through a pile of rocks and mushrooms, muttering to itself. It looks up with wide, yellow eyes as you enter.",
    "dmDescription": "Meepo the Kobold is separated from his clan. He has scavenged some dungeon fungi and minor trinkets. He knows the location of a nearby trap.",
    "size": 1,
    "winConditions": [
        { "condition": "Trade with Meepo", "reward": "Information on nearby trap" },
        { "condition": "Intimidate Meepo", "reward": "He flees via secret tunnel" }
    ],
    "tradeGoods": ["Torch", "Rations (1 day)", "Strange glowing mushroom"],
    "questHook": "Find his lost pet giant rat 'Snibbles' on the next floor.",
    "aiRoomPrompt": "Small cave alcove, small campfire, pile of junk and mushrooms, cozy rogue shelter style",
    "lair": false
}
```
