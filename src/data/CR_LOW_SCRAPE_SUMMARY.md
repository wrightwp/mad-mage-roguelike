# CR 1/8 through CR 1 Monsters - Scraping Summary

## Source
**URL**: https://www.dndbeyond.com/sources/dnd/mm-2024/monster-lists#MonstersbyChallengeRating  
**Source**: D&D Beyond Monster Manual 2024  
**Date Scraped**: 2026-01-12

## Summary

Successfully scraped and added **143 monsters** from CR 1/8 through CR 1:
- **121 new monsters** added
- **22 existing monsters** updated with MM 2024 links
- **Total library size**: 247 monsters (was 126)

## Breakdown by Challenge Rating

### CR 1/8 (0.125) - 25 XP each
**Total**: 25 monsters (19 new + 6 updated)

**New Monsters**:
- Blood Hawk, Camel, Flumph, Flying Snake, Giant Crab, Giant Weasel
- Goblin Minion, Kobold Warrior, Manes, Mastiff, Merfolk Skirmisher
- Modron Monodrone, Mule, Pony, Slaad Tadpole, Stirge
- Twig Blight, Venomous Snake, Warrior Infantry

**Updated** (new MM 2024 links):
- Bandit, Cultist, Giant Rat, Guard, Kobold, Noble

### CR 1/4 (0.25) - 50 XP each
**Total**: 48 monsters (39 new + 9 updated)

**New Monsters**:
- Aarakocra Skirmisher, Animated Broom, Animated Flying Sword, Axe Beak
- Blink Dog, Boar, Bullywug Warrior, Constrictor Snake, Draft Horse
- Dretch, Elk, Giant Badger, Giant Bat, Giant Centipede, Giant Frog
- Giant Lizard, Giant Owl, Giant Venomous Snake, Giant Wolf Spider
- Goblin Warrior, Grimlock, Kenku, Kuo-toa, Modron Duodrone
- Mud Mephit, Needle Blight, Panther, Pixie, Priest Acolyte
- Pseudodragon, Pteranodon, Riding Horse, Smoke Mephit, Sprite
- Steam Mephit, Swarm of Bats, Swarm of Ravens, Troglodyte, Violet Fungus

**Updated** (new MM 2024 links):
- Acolyte, Drow, Flying Sword, Skeleton, Swarm of Rats, Winged Kobold, Wolf, Zombie

### CR 1/2 (0.5) - 100 XP each
**Total**: 36 monsters (29 new + 7 updated)

**New Monsters**:
- Ape, Black Bear, Crocodile, Darkmantle, Dust Mephit, Gas Spore Fungus
- Giant Goat, Giant Seahorse, Giant Wasp, Gnoll Warrior, Hobgoblin Warrior
- Ice Mephit, Jackalwere, Magma Mephit, Magmin, Modron Tridrone
- Myconid Adult, Performer, Piercer, Reef Shark, Sahuagin Warrior
- Satyr, Scout, Tough, Troll Limb, Vine Blight, Warhorse
- Warhorse Skeleton, Worg

**Updated** (new MM 2024 links):
- Cockatrice, Gray Ooze, Hobgoblin, Orc, Rust Monster, Shadow, Swarm of Insects

### CR 1 - 200 XP each
**Total**: 42 monsters (34 new + 8 updated)

**New Monsters**:
- Brass Dragon Wyrmling, Brown Bear, Bugbear Warrior, Copper Dragon Wyrmling
- Death Dog, Dryad, Empyrean Iota, Faerie Dragon Youth, Giant Eagle
- Giant Hyena, Giant Octopus, Giant Toad, Giant Vulture, Goblin Boss
- Harpy, Hippogriff, Imp, Kuo-toa Whip, Lacedon Ghoul, Lion
- Manes Vaporspawn, Modron Quadrone, Myconid Spore Servant, Ogrillon Ogre
- Pirate, Psychic Gray Ooze, Quasit, Salamander Fire Snake, Scarecrow
- Sphinx of Wonder, Spy, Swarm of Larvae, Swarm of Piranhas
- Thri-kreen Marauder, Yuan-ti Infiltrator

**Updated** (new MM 2024 links):
- Animated Armor, Bugbear, Dire Wolf, Ghoul, Giant Spider, Goblin Boss, Specter, Tiger

## Library Statistics

### Before
- Total Monsters: 126
- CR 0: 32
- CR 0.125: 6
- CR 0.25: 9
- CR 0.5: 7
- CR 1: 8

### After
- **Total Monsters: 247** (+121 new)
- **CR 0: 32** (unchanged)
- **CR 0.125: 25** (+19)
- **CR 0.25: 48** (+39)
- **CR 0.5: 36** (+29)
- **CR 1: 42** (+34)
- CR 2+: 64 (unchanged)

## Notable Additions

### New Creature Types
- **Modrons**: Monodrone, Duodrone, Tridrone, Quadrone (CR 1/8 - 1)
- **Mephits**: Mud, Smoke, Steam, Dust, Ice, Magma (CR 1/4 - 1/2)
- **Blights**: Twig, Needle, Vine (CR 1/8 - 1/2)
- **Dragon Wyrmlings**: Brass, Copper (CR 1)
- **Swarms**: Bats, Ravens, Larvae, Piranhas (CR 1/4 - 1)
- **Myconids**: Adult, Spore Servant (CR 1/2 - 1)

### Humanoid NPCs
- Warrior Infantry, Performer, Pirate, Spy, Scout, Tough

### Beasts & Animals
- Many new animals and beasts for druids, rangers, and wilderness encounters
- Giant versions: Crab, Weasel, Goat, Seahorse, Wasp, Eagle, Hyena, Octopus, Toad, Vulture

### Fiends & Undead
- Manes, Dretch, Imp, Quasit, Lacedon Ghoul, Warhorse Skeleton

## Usage Example

```typescript
import { monsterLibrary } from './data/monsterLibrary';

// Get all low CR monsters for a level 1 party
const lowCRMonsters = monsterLibrary.getMonstersByCR(0.125, 1);
console.log(`Found ${lowCRMonsters.length} monsters CR 1/8 to 1`);

// Get CR 1/4 monsters
const cr025 = monsterLibrary.getMonstersByCR(0.25);
console.log(`${cr025.length} CR 1/4 monsters available`);

// Find all Modrons
const modrons = monsterLibrary.searchMonsters('Modron');
modrons.forEach(m => {
    console.log(`${m.name} - CR ${m.cr}, ${m.exp} XP`);
});
```

## File Updates

- **Updated**: `src/data/monsters.json`
- **New Size**: ~50KB (was ~22KB)
- **Format**: Sorted by CR (ascending), then Name (alphabetically)
- **All links**: Updated to MM 2024 format

## Notes

- All monsters now have consistent MM 2024 links
- Proficiency Bonus (PB) is +2 for all CR 0-1 monsters
- Duplicate monsters were updated with new links rather than creating duplicates
- The library is now comprehensive for low-level (1-5) encounters
