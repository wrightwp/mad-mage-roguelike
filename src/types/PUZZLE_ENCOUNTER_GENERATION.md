# Puzzle Encounter Generation Guide

This document provides guidelines for AI-assisted **Puzzle Encounter** generation following D&D 2024 rules and the `PuzzleEncounterData` interface.

## Core Concepts

Puzzle encounters challenge the players' intellect rather than their combat stats. They should be engaging, logical, and offer clear feedback.

---

## Encounter Design Rules

### Mechanics and Clarity (`puzzleDescription`)
- **Clarity is King**: The goal should be obvious (e.g., "open the door", "stop the crushing walls"), even if the method is not.
- **Physicality**: Use interactable objects like levers, statues, pressure plates, or runes. Avoid purely abstract riddles unless integrated into the environment.
- **Feedback**: Describe what happens when players attempt a solution (e.g., "The mechanism clicks loudly but doesn't budge," vs. "A soft hum emanates from the statue").

### Difficulty Class (`dc`)
- **DC 10**: Easy (Obvious patterns, simple physical tasks)
- **DC 15**: Moderate (Requires investigation, multi-step logic)
- **DC 20**: Hard (Complex ciphers, hidden components, time pressure)

### Solutions (`solution`)
- Define the correct solution clearly.
- **Fail-Forward**: If players fail the check or puzzle, consider consequences (damage, alarm, lost time) rather than a complete standstill.

### Rewards (`xpBudget`)
- Award XP equivalent to a combat encounter of similar difficulty.
- Solving a puzzle is overcoming a challenge.

### Penalties (`penalty`)
- Optional consequences for incorrect attempts.
- Examples: 1d6 Lightning damage, a summoned monster (transitions to combat), or locking the mechanism for 10 minutes.

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
        { "condition": "Solve the puzzle", "reward": "Door opens, 200 XP" },
        { "condition": "Smash the door (AC 17, HP 30)", "reward": "0 XP, Noise attracts attention" }
    ],
    "aiRoomPrompt": "Dungeon room, two statues guarding a door, pile of rusty weapons, torchlight, mysterious atmosphere",
    "lair": false
}
```
