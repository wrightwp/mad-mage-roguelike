# CR 0 Monsters - Scraping Summary

## Source
**URL**: https://www.dndbeyond.com/sources/dnd/mm-2024/monster-lists#CR0  
**Source**: D&D Beyond Monster Manual 2024  
**Date Scraped**: 2026-01-12

## Monsters Added

Successfully scraped and added **31 new CR 0 monsters** to the monster library:

### Animals (24 total)
1. **Baboon** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Baboon
2. **Badger** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Badger
3. **Bat** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Bat
4. **Cat** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Cat
5. **Crab** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Crab
6. **Deer** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Deer
7. **Eagle** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Eagle
8. **Frog** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Frog
9. **Giant Fire Beetle** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#GiantFireBeetle
10. **Goat** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Goat
11. **Hawk** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Hawk
12. **Hyena** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Hyena
13. **Jackal** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Jackal
14. **Lizard** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Lizard
15. **Octopus** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Octopus
16. **Owl** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Owl
17. **Piranha** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Piranha
18. **Rat** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Rat
19. **Raven** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Raven
20. **Scorpion** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Scorpion
21. **Seahorse** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Seahorse
22. **Spider** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Spider
23. **Vulture** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Vulture
24. **Weasel** - https://www.dndbeyond.com/sources/dnd/mm-2024/animals#Weasel

### Plants & Fungi (2 total)
25. **Awakened Shrub** - https://www.dndbeyond.com/sources/dnd/mm-2024/monsters-a#AwakenedShrub
26. **Myconid Sprout** - https://www.dndbeyond.com/sources/dnd/mm-2024/monsters-m#MyconidSprout
27. **Shrieker Fungus** - https://www.dndbeyond.com/sources/dnd/mm-2024/monsters-f#ShriekerFungus

### Undead & Constructs (2 total)
28. **Crawling Claw** - https://www.dndbeyond.com/sources/dnd/mm-2024/monsters-c#CrawlingClaw
29. **Larva** - https://www.dndbeyond.com/sources/dnd/mm-2024/monsters-l#Larva

### Fiends (1 total)
30. **Lemure** - https://www.dndbeyond.com/sources/dnd/mm-2024/monsters-l#Lemure

### Constructs (1 total)
31. **Homunculus** - https://www.dndbeyond.com/sources/dnd/mm-2024/monsters-h#Homunculus

## Monster Statistics

- **CR**: 0
- **XP**: 10 (each)
- **Proficiency Bonus**: +2 (each)

## Already Existing

The following CR 0 monster was already in the library:
- **Commoner** - https://www.dndbeyond.com/monsters/16829-commoner

## Total CR 0 Monsters

**32 total CR 0 monsters** now in the library (31 new + 1 existing)

## Library Update

Updated file: `src/data/monsters.json`  
New file size: ~23KB (increased from ~17KB)  
Total monsters in library: **130+** (was ~100)

## Usage Example

```typescript
import { monsterLibrary } from './data/monsterLibrary';

// Get all CR 0 monsters
const cr0Monsters = monsterLibrary.getMonstersByCR(0);
console.log(`Found ${cr0Monsters.length} CR 0 monsters`);

// Get a specific CR 0 monster
const bat = monsterLibrary.getMonsterByName('Bat');
console.log(`${bat.name}: CR ${bat.cr}, ${bat.exp} XP`);
console.log(`Monster Manual: ${bat.mmLink}`);
```

## Notes

- All links point to the **2024 Monster Manual** on D&D Beyond
- Links use the new MM-2024 format with section anchors
- Most CR 0 monsters are animals suitable for:
  - Familiar companions
  - Wild shape forms (druids)
  - Environmental encounters
  - Flavor/atmosphere
- Some (Lemure, Crawling Claw, Larva) are suitable for undead/horror encounters
