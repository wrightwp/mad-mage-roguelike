---
name: scrape_monsters
description: Scrapes monster data from a 2024 Monster Manual URL for a specific Challenge Rating (CR) and updates the monsters.json database.
---

# Scrape Monsters Skill

Use this skill when you need to add or update monster data in the project's database from official or reference sources (like D&D Beyond's 2024 Monster Manual).

## 1. Extract Data in batches
Provide a URL that points to a list of monsters page. The skill will only extract monsters listed on that page.
Use `read_browser_page` on the provided URL to extract the following information:
- **Name**: The full name of the monster.
- **CR**: Challenge Rating (e.g., 1/8, 1/4, 2, 10). AKA "Challenge"
- **EXP**: Experience points awarded for defeating the monster. AKA "XP"
- **Thematic Type**: The creature category (e.g., "Humanoid", "Undead", "Fiend", "Dragon"). AKA "Type"
- **mmLink**: The direct URL to the individual monster's page. AKA "Link"
- **mmPage**: The page number of the monster in the 2024 Monster Manual. AKA "Source"

## 2. Format JSON in batches
Construct a `MonsterData` object for each monster found:
```json
{
  "name": "Monster Name",
  "cr": 0.25,
  "exp": 50,
  "pb": 2,
  "mmLink": "https://www.dndbeyond.com/monsters/5194996-flaming-skeleton",
  "thematicType": "Type"
}`
```
*Note: Convert fractional CRs strings to numbers (e.g., "1/8" -> 0.125).*

## 3. Update Database in batches
1. Read the current contents of `src/data/monsters.json`.
2. check if the monster already exists (by name).
3. If it exists, update any fields that have changed.
4. If it's new, append it to the list.
5. Sort the list by CR (ascending) then by Name.
6. Save the updated file using `write_to_file`.

## 4. Final Verification in batches
- Ensure the `thematicType` is accurate to the 2024 manual.
- Inform the user of the monsters added or updated.
