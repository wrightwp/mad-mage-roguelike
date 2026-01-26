---
name: add_monster
description: Adds a new monster entry to the project's monster data file.
---

# Add Monster Skill

Use this skill when the user asks you to "add a monster", "create a new monster entry", or "update the monster list".

## 1. Gather Information
Ensure you have the following details for the monster. If missing, ask the user or look them up (if a real D&D monster).
- **Name**: The name of the monster.
- **CR**: Challenge Rating (number).
- **XP**: Experience points (number). refer to `MONSTER_QUICK_REFERENCE.md` if unsure.
- **PB**: Proficiency Bonus (typically 2 for low CR, scales with CR).
- **Link**: A URL to the D&D Beyond entry or similar source.

## 2. Read the Database
Read the file `src/data/monsters.json`.
- This file is large, so finding if a monster exists might require `grep_search` first to avoid reading the whole file if just checking existence.
- However, to append, you will eventually need to read/write the JSON structure.

## 3. Construct the Entry
Create a JSON object:
```json
{
    "name": "Monster Name",
    "cr": 1,
    "exp": 200,
    "pb": 2,
    "mmLink": "https://..."
}
```

## 4. Append and Save
1.  Read the current content of `src/data/monsters.json`.
2.  Parse the JSON array.
3.  Check if a monster with the same name already exists.
    - If yes, ask the user if they want to update it.
    - If no, push the new object to the array.
4.  Write the updated array back to `src/data/monsters.json` using `write_to_file`.
    - **IMPORTANT**: Ensure the JSON is valid before writing.
