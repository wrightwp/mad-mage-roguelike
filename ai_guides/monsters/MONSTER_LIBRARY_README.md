# Monster Library

A comprehensive library of D&D 5e monsters for encounter building in the Mad Mage Roguelike.

## Data Structure

Each monster in the library contains:
- **name**: Monster name
- **cr**: Challenge Rating (can be fractional: 0.125, 0.25, 0.5, or whole numbers)
- **exp**: Experience points awarded
- **pb**: Proficiency Bonus
- **mmLink**: Direct link to the monster's D&D Beyond Monster Manual entry

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

The library includes:
- **Goblinoids**: Goblins, Hobgoblins, Bugbears
- **Undead**: Skeletons, Zombies, Ghouls, Wraiths, Vampires, Liches
- **Giants**: Hill, Stone, Frost, Fire, Cloud, Storm
- **Oozes**: Gelatinous Cube, Black Pudding, Ochre Jelly, Gray Ooze
- **Aberrations**: Beholders, Mind Flayers, Aboleths
- **Drow**: Warriors, Mages, Priestesses, Driders
- **Dragons**: All chromatic dragons (White, Black, Green, Blue, Red) from Wyrmling to Ancient
- **Humanoids**: Cultists, Bandits, Guards, Knights, Mages, Priests
- **Beasts**: Tigers, Wolves, Giant Spiders, Swarms
- **Constructs**: Animated Armor, Flying Swords, Gargoyles
- **Monstrosities**: Minotaurs, Owlbears, Basilisks, Medusas, Mimics

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
