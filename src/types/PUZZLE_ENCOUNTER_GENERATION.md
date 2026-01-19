# Puzzle Encounter Generation Guide

This document provides guidelines for AI-assisted **Puzzle Encounter** generation following D&D 2024 rules and the `PuzzleEncounterData` interface.

## Core Concepts

Puzzle encounters challenge the players' intellect rather than their combat stats. They must now focus on player agency, offering multiple valid approaches with varying risks and rewards.

---

## Encounter Design Rules

### Mechanics and Clarity (`puzzleDescription`)
- **Clarity is King**: The goal should be obvious (e.g., "open the door", "stop the crushing walls"), even if the method is not.
- **Physicality**: Use interactable objects like levers, statues, pressure plates, or runes. Avoid purely abstract riddles unless integrated into the environment.
- **Feedback**: Describe what happens when players attempt a solution (e.g., "The mechanism clicks loudly but doesn't budge," vs. "A soft hum emanates from the statue").

### Multiple Solutions & Dynamic Outcomes
Every puzzle **MUST** have at least **three** distinct ways to be resolved. This prevents progress-blocking and rewards different playstyles:
1.  **The "Intended" Solution**: The logical/intellectual path. High reward, low cost.
2.  **The "Skill/Resource" Solution**: Using character abilities (Thieves' Tools, Athletics, Spells). Moderate reward, potential resource cost (spell slots, HP).
3.  **The "Brute Force" Solution**: Smashing, breaking, or bypassing logic. Low/No reward, negative consequences (noise, damage, lost loot).

### Difficulty Class (`dc`)
- **DC 10**: Easy (Obvious patterns, simple physical tasks)
- **DC 15**: Moderate (Requires investigation, multi-step logic)
- **DC 20**: Hard (Complex ciphers, hidden components, time pressure)

### Rewards & Consequences (`xpBudget`, `winConditions`)
- **Variable XP**: Award full XP for the Intended/Skill solution. Award partial or zero XP for Brute Force.
- **Loot**: Puzzles often protect treasure. Brute force might destroy the treasure.
- **Consequences**: Failed checks or Brute Force methods should have tangible downsides (Damage, Alarm, Debuffs).

---

## Example Puzzle Encounter Template

```json
{
    "name": "The Weighing Room",
    "level": 1,
    "type": "puzzle",
    "difficulty": "moderate",
    "xpBudget": 200,
    "roomDescription": "Two stone statues of warriors stand on opposite sides of a heavy iron door. One statue holds a stone sword, the other an empty hand outstretched. In the center of the room is a pile of rusty weapons and shields.",
    "dmDescription": "The door is magi-locked. The statue with the empty hand expects a weapon of equal weight to the stone sword (approx 10 lbs).",
    "puzzleDescription": "Players must place an item or combination of items weighing exactly 10 lbs into the statue's hand to balance the mechanism.",
    "solution": "Place a shield (6 lbs) and a longsword (3 lbs) or any combination totaling 9-11 lbs.",
    "dc": 12,
    "penalty": "If the weight is off by more than 5 lbs, the statue swings its arm, dealing 1d6 Bludgeoning damage to the person placing the item.",
    "size": 1,
    "winConditions": [
        {
            "condition": "Perfect Balance (Intended)",
            "reward": "Door opens silently. Secret compartment opens revealing a Potion of Healing. Award 200 XP."
        },
        {
            "condition": "Disable Mechanism (Thieves' Tools DC 15)",
            "reward": "Door unlocks. No secret compartment. Award 150 XP."
        },
        {
            "condition": "Smash the Door (AC 17, HP 30)",
            "reward": "Door broken. Noise attracts nearby patrols. 0 XP. Secret potion vial shatters."
        }
    ],
    "aiRoomPrompt": "Dungeon room, two statues guarding a door, pile of rusty weapons, torchlight, mysterious atmosphere",
    "lair": false
}
```
