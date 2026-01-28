# Encounter Scaling Guide (D&D 2024)

This guide defines how to scale encounters for different **Tiers of Play**, **Party Levels**, and **Party Sizes**.

## Runtime Application

Scaling is applied dynamically at the moment the party **Enters an Encounter**. The system must compare the **Current Party State** (Level and Size) against the **Encounter's Reference Level** and its **Original XP Budget**.

## Tiers of Play

All encounters should be tagged with a **Tier** and a **Reference Level** (the `level` field).

| Tier | Levels | Reference Level Focus |
| :--- | :--- | :--- |
| **Tier 1** | 1–4 | Base content for lower levels. |
| **Tier 2** | 5–10 | Heroic exploits and greater threats. |
| **Tier 3** | 11–16 | Realm-shaping challenges. |
| **Tier 4** | 17+ | Multiversal threats. |

## Scaling Rules

When an encounter's **Reference Level** does not match the **Current Party Level**, use the following scaling rules.

### 1. DC Scaling (Traps, Hazards, Skills)
As party level increases, characters' proficiency bonuses and ability scores increase. Adjust DCs to maintain the intended challenge.

**Formula**: `New DC = Base DC + (Current Party Level - Reference Level)`
*Note: For every 2 levels above the reference, increase the DC by roughly 1.*

| Level Difference | DC Adjustment |
| :--- | :--- |
| +1 to +2 | +1 |
| +3 to +4 | +2 |
| +5 to +6 | +3 |

**Party Size Adjustment**: Increase the DC by `+1` if the party size is 6 or more to account for more "help" actions and expertise.

### 2. Damage Scaling
Damage for traps and hazards must scale to remain a threat relative to increased HP.

**Formula**: Increase damage by approximately **1d6 (or 3.5)** for every 2 levels above the Reference Level.

| Level Difference | Damage Adjustment |
| :--- | :--- |
| +1 to +2 | +1 dice (e.g., 2d6 -> 3d6) |
| +3 to +4 | +2 dice |
| +5 to +6 | +3 dice |

### 3. Combat Scaling (Monsters)
Monsters have fixed CRs. Scaling is handled by:
- **Adding Minions**: Add 1-2 low-CR minions for every level above the Reference Level.
- **Adjusting Counts**: For every additional player above 4, add the equivalent of 25% of the total XP budget in monsters.

## Tier-Based Selection Logic

1.  **Filter by Tier**: Only select encounters that match the party's current Tier.
2.  **XP Budget Check**: Ensure the encounter's total XP fits within the party's current **Low**, **Moderate**, or **High** budget (calculated using the 2024 DMG table).
3.  **No Downscaling Limits**: If an encounter's XP budget is too high for the party's current level (even within the same Tier), **do not** select it.

## Example Scaling Request
"Generate a Tier 2 Combat Encounter at Level 7 for a party of 5."
- **Base Level**: 5 (Reference).
- **Party Level**: 7 (Reference + 2).
- **Adjustment**: Add 2 minions or increase counts to match the Level 7 XP budget for 5 players.
