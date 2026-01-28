# Monster Library

A comprehensive library of D&D 5e monsters for encounter building in the Mad Mage Roguelike.

## Data Structure

    Each monster in the library contains:
    - **name**: Monster name
    - **cr**: Challenge Rating (can be fractional: 0.125, 0.25, 0.5, or whole numbers)
    - **exp**: Experience points awarded
    - **pb**: Proficiency Bonus
    - **mmLink**: Direct link to the monster's D&D Beyond Monster Manual entry
    - **thematicType**: The type of monster (e.g., Humanoid, Beast, Undead)
    - **mmPage**: Page reference in the Monster Manual (if available)

## XP vs CR Reference

| Challenge Rating (CR) | XP Award | | Challenge Rating (CR) | XP Award |
| :--- | :--- | :--- | :--- | :--- |
| **0** | 0 or 10 | | **14** | 11,500 |
| **1/8** | 25 | | **15** | 13,000 |
| **1/4** | 50 | | **16** | 15,000 |
| **1/2** | 100 | | **17** | 18,000 |
| **1** | 200 | | **18** | 20,000 |
| **2** | 450 | | **19** | 22,000 |
| **3** | 700 | | **20** | 25,000 |
| **4** | 1,100 | | **21** | 33,000 |
| **5** | 1,800 | | **22** | 41,000 |
| **6** | 2,300 | | **23** | 50,000 |
| **7** | 2,900 | | **24** | 62,000 |
| **8** | 3,900 | | **25** | 75,000 |
| **9** | 5,000 | | **26** | 90,000 |
| **10** | 5,900 | | **27** | 105,000 |
| **11** | 7,200 | | **28** | 120,000 |
| **12** | 8,400 | | **29** | 135,000 |
| **13** | 10,000 | | **30** | 155,000 |

## Usage

### Import the Library

```typescript
import { monsterLibrary } from './data/monsterLibrary';
```

### Get Monster by Name

```typescript
const goblin = monsterLibrary.getMonsterByName('Goblin');
// Returns: { name: 'Goblin', cr: 0.25, exp: 50, pb: 2, mmLink: '...' }
```

### Search Monsters by CR

```typescript
// Get all CR 1 monsters
const cr1Monsters = monsterLibrary.getMonstersByCR(1);

// Get monsters in a CR range (CR 1-3)
const lowLevelMonsters = monsterLibrary.getMonstersByCR(1, 3);
```

### Get Monsters for Party Level

```typescript
// Get appropriate monsters for a level 5 party (CR 3-7)
const monstersForLevel5 = monsterLibrary.getMonstersForPartyLevel(5);
```

### Search by Name

```typescript
// Find all dragons
const dragons = monsterLibrary.searchMonsters('dragon');

// Find all undead with "zombie" in the name
const zombies = monsterLibrary.searchMonsters('zombie');
```

### Random Monster Selection

```typescript
// Get any random monster
const randomMonster = monsterLibrary.getRandomMonster();

// Get random monster within CR range
const randomBoss = monsterLibrary.getRandomMonster({ minCR: 10, maxCR: 15 });
```

### Calculate Total XP

```typescript
// Calculate XP for an encounter
const encounterXP = monsterLibrary.calculateTotalXP([
    'Goblin',
    'Goblin',
    'Goblin Boss'
]);
// Returns: 300 (50 + 50 + 200)
```

### Other Utilities

```typescript
// Get all monsters
const allMonsters = monsterLibrary.getAllMonsters();

// Get total count
const count = monsterLibrary.getMonsterCount();

// Get all unique CR values
const allCRs = monsterLibrary.getAllCRs();
// Returns: [0, 0.125, 0.25, 0.5, 1, 2, 3, ...]
```

## Monster Categories

    The library includes the following thematic types (based on `monsters.json`):
    - **Aberration**: Beholders, Mind Flayers, Aboleths
    - **Beast**: Tigers, Wolves, Giant Spiders, Swarms
    - **Celestial**: Angels, Pegasi, Unicorns
    - **Construct**: Animated Armor, Flying Swords, Golems
    - **Dragon**: Chromatic and Metallic Dragons, Wyverns
    - **Elemental**: Air/Earth/Fire/Water Elementals, Mephits, Salamanders
    - **Fey**: Hags, Pixies, Satyrs, Dryads
    - **Fiend**: Demons, Devils, Yugoloths
    - **Giant**: Hill/Stone/Frost/Fire/Cloud/Storm Giants, Ogres, Trolls
    - **Humanoid**: Cultists, Bandits, Guards, Knights, Mages, Priests
    - **Monstrosity**: Minotaurs, Owlbears, Basilisks, Mimics
    - **Ooze**: Gelatinous Cube, Black Pudding, Ochre Jelly
    - **Plant**: Shambling Mounds, Treants, Blights
    - **Undead**: Skeletons, Zombies, Ghouls, Wraiths, Vampires, Liches

## Integration with Encounters

You can use the monster library to enhance your encounter data:

```typescript
import { monsterLibrary } from './data/monsterLibrary';
import { encounterLibrary } from './data/encounterLibrary';

// Get an encounter
const encounter = encounterLibrary.getRandomEncounter('combat', 3);

// Parse the creatures and get their details
if (encounter?.creatures) {
    const creatureNames = encounter.creatures.split(',').map(c => c.trim());
    const monsterDetails = creatureNames
        .map(name => monsterLibrary.getMonsterByName(name))
        .filter(m => m !== null);
    
    // Now you have full monster stats with MM links!
    monsterDetails.forEach(monster => {
        console.log(`${monster.name} - CR ${monster.cr}, ${monster.exp} XP`);
        console.log(`Monster Manual: ${monster.mmLink}`);
    });
}
```

## Current Statistics

- **Total Monsters**: 100+
- **CR Range**: 0 to 24
- **XP Range**: 10 to 62,000
- **All monsters link to D&D Beyond Monster Manual entries**
