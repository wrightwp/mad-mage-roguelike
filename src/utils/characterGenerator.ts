
export interface AbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

type AbilityKey = keyof AbilityScores;

export interface GeneratedCharacter {
  name: string;
  className: string;
  subclass?: string;
  level: number;
  classInputs: string[];
  spells: string[];
  background: string;
  backgroundBoosts: {
    plus2: AbilityKey;
    plus1: AbilityKey;
  };
  originFeat: string;
  originFeatDetail: string;
  backgroundSkillProficiencies: string[];
  species: string;
  ancestry?: string;
  speciesInputs: string[];
  languages: string[];
  abilityScores: AbilityScores;
  modifiers: AbilityScores;
}

type ClassData = {
  hd: number;
  primary: AbilityKey[];
  saves: AbilityKey[];
  skills: string[];
  caster: boolean;
  spellStat?: AbilityKey;
  subclasses: string[];
};

type BackgroundData = {
  stats: AbilityKey[];
  feat: string;
  skillProficiencies?: string[];
};

const OPTIMIZE_STATS = true;

const CLASSES: Record<string, ClassData> = {
  Barbarian: {
    hd: 12,
    primary: ['STR', 'CON'],
    saves: ['STR', 'CON'],
    skills: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'],
    caster: false,
    subclasses: ['Path of the Berserker', 'Path of the Wild Heart', 'Path of the World Tree', 'Path of the Zealot']
  },
  Bard: {
    hd: 8,
    primary: ['CHA', 'DEX'],
    saves: ['DEX', 'CHA'],
    skills: ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'],
    caster: true,
    spellStat: 'CHA',
    subclasses: ['College of Dance', 'College of Glamour', 'College of Lore', 'College of Valor']
  },
  Cleric: {
    hd: 8,
    primary: ['WIS', 'CON'],
    saves: ['WIS', 'CHA'],
    skills: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'],
    caster: true,
    spellStat: 'WIS',
    subclasses: ['Life Domain', 'Light Domain', 'Trickery Domain', 'War Domain']
  },
  Druid: {
    hd: 8,
    primary: ['WIS', 'CON'],
    saves: ['INT', 'WIS'],
    skills: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'],
    caster: true,
    spellStat: 'WIS',
    subclasses: ['Circle of the Land', 'Circle of the Moon', 'Circle of the Sea', 'Circle of the Stars']
  },
  Fighter: {
    hd: 10,
    primary: ['STR', 'CON'],
    saves: ['STR', 'CON'],
    skills: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'],
    caster: false,
    subclasses: ['Battle Master', 'Champion', 'Eldritch Knight', 'Psi Warrior']
  },
  Monk: {
    hd: 8,
    primary: ['DEX', 'WIS'],
    saves: ['STR', 'DEX'],
    skills: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'],
    caster: false,
    subclasses: ['Warrior of the Elements', 'Warrior of Mercy', 'Warrior of the Open Hand', 'Warrior of Shadow']
  },
  Paladin: {
    hd: 10,
    primary: ['STR', 'CHA'],
    saves: ['WIS', 'CHA'],
    skills: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'],
    caster: true,
    spellStat: 'CHA',
    subclasses: ['Oath of the Ancients', 'Oath of Devotion', 'Oath of Glory', 'Oath of Vengeance']
  },
  Ranger: {
    hd: 10,
    primary: ['DEX', 'WIS'],
    saves: ['STR', 'DEX'],
    skills: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'],
    caster: true,
    spellStat: 'WIS',
    subclasses: ['Beast Master', 'Fey Wanderer', 'Gloom Stalker', 'Hunter']
  },
  Rogue: {
    hd: 8,
    primary: ['DEX', 'INT'],
    saves: ['DEX', 'INT'],
    skills: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'],
    caster: false,
    subclasses: ['Arcane Trickster', 'Assassin', 'Soulknife', 'Thief']
  },
  Sorcerer: {
    hd: 6,
    primary: ['CHA', 'CON'],
    saves: ['CON', 'CHA'],
    skills: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'],
    caster: true,
    spellStat: 'CHA',
    subclasses: ['Aberrant Sorcery', 'Clockwork Sorcery', 'Draconic Sorcery', 'Wild Magic Sorcery']
  },
  Warlock: {
    hd: 8,
    primary: ['CHA', 'CON'],
    saves: ['WIS', 'CHA'],
    skills: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'],
    caster: true,
    spellStat: 'CHA',
    subclasses: ['Archfey Patron', 'Celestial Patron', 'Fiend Patron', 'Great Old One Patron']
  },
  Wizard: {
    hd: 6,
    primary: ['INT', 'DEX'],
    saves: ['INT', 'WIS'],
    skills: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'],
    caster: true,
    spellStat: 'INT',
    subclasses: ['Abjurer', 'Diviner', 'Evoker', 'Illusionist']
  }
};

export const CLASS_NAMES = Object.keys(CLASSES);

const SPECIES_DATA: Record<string, string[]> = {
  Human: [],
  Aasimar: [],
  Dwarf: [],
  Gnome: [],
  Halfling: [],
  Orc: [],
  Dragonborn: ['Black (Acid)', 'Blue (Lightning)', 'Brass (Fire)', 'Bronze (Lightning)', 'Copper (Acid)', 'Gold (Fire)', 'Green (Poison)', 'Red (Fire)', 'Silver (Cold)', 'White (Cold)'],
  Elf: ['Drow', 'High Elf', 'Wood Elf'],
  Goliath: ['Cloud Giant', 'Fire Giant', 'Frost Giant', 'Hill Giant', 'Stone Giant', 'Storm Giant'],
  Tiefling: ['Abyssal', 'Cthonic', 'Infernal']
};

const LANGUAGES = ['Abyssal', 'Celestial', 'Common', 'Draconic', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish', 'Goblin', 'Halfling', 'Infernal', 'Orc'];

const BACKGROUNDS: Record<string, BackgroundData> = {
  Acolyte: { stats: ['INT', 'WIS', 'CHA'], feat: 'Magic Initiate (Cleric)' },
  Artisan: { stats: ['STR', 'DEX', 'INT'], feat: 'Crafter' },
  Charlatan: { stats: ['DEX', 'CON', 'CHA'], feat: 'Skilled' },
  Criminal: { stats: ['DEX', 'CON', 'INT'], feat: 'Alert' },
  Entertainer: { stats: ['STR', 'DEX', 'CHA'], feat: 'Musician' },
  Farmer: { stats: ['STR', 'CON', 'WIS'], feat: 'Tough' },
  Guard: { stats: ['STR', 'INT', 'WIS'], feat: 'Alert' },
  Guide: { stats: ['DEX', 'CON', 'WIS'], feat: 'Magic Initiate (Druid)' },
  Hermit: { stats: ['CON', 'WIS', 'CHA'], feat: 'Healer' },
  Merchant: { stats: ['CON', 'INT', 'CHA'], feat: 'Lucky' },
  Noble: { stats: ['STR', 'INT', 'CHA'], feat: 'Skilled' },
  Sage: { stats: ['CON', 'INT', 'WIS'], feat: 'Magic Initiate (Wizard)' },
  Sailor: { stats: ['STR', 'DEX', 'WIS'], feat: 'Tavern Brawler', skillProficiencies: ['Athletics'] },
  Scribe: { stats: ['DEX', 'INT', 'WIS'], feat: 'Skilled' },
  Soldier: { stats: ['STR', 'DEX', 'CON'], feat: 'Savage Attacker' },
  Wayfarer: { stats: ['DEX', 'WIS', 'CHA'], feat: 'Lucky' }
};

const CLASS_SPELLS: Record<string, Record<number, string[]>> = {
  Bard: {
    0: ['Blade Ward', 'Dancing Lights', 'Friends', 'Light', 'Mage Hand', 'Message', 'Minor Illusion', 'Prestidigitation', 'Thunderclap', 'True Strike', 'Vicious Mockery'],
    1: ['Animal Friendship', 'Bane', 'Charm Person', 'Color Spray', 'Command', 'Cure Wounds', 'Detect Magic', 'Disguise Self', 'Faerie Fire', 'Feather Fall', 'Healing Word', 'Heroism', 'Identify', 'Illusory Script', 'Longstrider', 'Silent Image', 'Sleep', 'Speak with Animals', 'Thunderwave', 'Unseen Servant'],
    2: ['Aid', 'Blindness/Deafness', 'Calm Emotions', 'Cloud of Daggers', 'Crown of Madness', 'Detect Thoughts', 'Enhance Ability', 'Enthrall', 'Heat Metal', 'Hold Person', 'Invisibility', 'Knock', 'Lesser Restoration', 'Locate Animals or Plants', 'Locate Object', 'Magic Mouth', 'Mirror Image', 'Phantasmal Force', 'Shatter', 'Silence', 'Suggestion', 'Zone of Truth'],
    3: ['Bestow Curse', 'Clairvoyance', 'Dispel Magic', 'Fear', 'Feign Death', 'Glyph of Warding', 'Hypnotic Pattern', "Leomund's Tiny Hut", 'Major Image', 'Nondetection', 'Plant Growth', 'Sending', 'Speak with Dead', 'Speak with Plants', 'Stinking Cloud', 'Tongues'],
    4: ['Charm Monster', 'Compulsion', 'Confusion', 'Dimension Door', 'Freedom of Movement', 'Greater Invisibility', 'Hallucinatory Terrain', 'Locate Creature', 'Polymorph'],
    5: ['Animate Objects', 'Awaken', 'Dominate Person', 'Dream', 'Geas', 'Greater Restoration', 'Hold Monster', 'Legend Lore', 'Mass Cure Wounds', 'Mislead', 'Modify Memory', 'Planar Binding', 'Raise Dead', 'Scrying', 'Seeming', 'Teleportation Circle'],
    6: ['Eyebite', 'Find the Path', 'Guards and Wards', 'Mass Suggestion', "Otto's Irresistible Dance", 'Programmed Illusion', 'True Seeing'],
    7: ['Etherealness', 'Forcecage', 'Mirage Arcane', "Mordenkainen's Magnificent Mansion", "Mordenkainen's Sword", 'Project Image', 'Regenerate', 'Resurrection', 'Symbol', 'Teleport'],
    8: ['Dominate Monster', 'Feeblemind', 'Glibness', 'Mind Blank', 'Power Word Stun'],
    9: ['Foresight', 'Power Word Heal', 'Power Word Kill', 'Prismatic Wall', 'True Polymorph']
  },
  Cleric: {
    0: ['Guidance', 'Light', 'Mending', 'Resistance', 'Sacred Flame', 'Spare the Dying', 'Thaumaturgy', 'Toll the Dead', 'Word of Radiance'],
    1: ['Bane', 'Bless', 'Command', 'Create or Destroy Water', 'Cure Wounds', 'Detect Evil and Good', 'Detect Magic', 'Detect Poison and Disease', 'Guiding Bolt', 'Healing Word', 'Inflict Wounds', 'Protection from Evil and Good', 'Purify Food and Drink', 'Sanctuary', 'Shield of Faith'],
    2: ['Aid', 'Augury', 'Blindness/Deafness', 'Calm Emotions', 'Continual Flame', 'Enhance Ability', 'Find Traps', 'Gentle Repose', 'Hold Person', 'Lesser Restoration', 'Locate Object', 'Prayer of Healing', 'Protection from Poison', 'Silence', 'Spiritual Weapon', 'Warding Bond', 'Zone of Truth'],
    3: ['Animate Dead', 'Beacon of Hope', 'Bestow Curse', 'Clairvoyance', 'Create Food and Water', 'Daylight', 'Dispel Magic', 'Feign Death', 'Glyph of Warding', 'Magic Circle', 'Mass Healing Word', 'Meld into Stone', 'Protection from Energy', 'Remove Curse', 'Revivify', 'Sending', 'Speak with Dead', 'Spirit Guardians', 'Tongues', 'Water Walk'],
    4: ['Banishment', 'Control Water', 'Death Ward', 'Divination', 'Freedom of Movement', 'Guardian of Faith', 'Locate Creature', 'Stone Shape'],
    5: ['Commune', 'Contagion', 'Dispel Evil and Good', 'Flame Strike', 'Geas', 'Greater Restoration', 'Hallow', 'Insect Plague', 'Legend Lore', 'Mass Cure Wounds', 'Planar Binding', 'Raise Dead', 'Scrying'],
    6: ['Blade Barrier', 'Create Undead', 'Find the Path', 'Forbiddance', 'Harm', 'Heal', "Heroes' Feast", 'Planar Ally', 'True Seeing', 'Word of Recall'],
    7: ['Conjure Celestial', 'Divine Word', 'Etherealness', 'Fire Storm', 'Plane Shift', 'Regenerate', 'Resurrection', 'Symbol'],
    8: ['Antimagic Field', 'Control Weather', 'Earthquake', 'Holy Aura'],
    9: ['Astral Projection', 'Gate', 'Mass Heal', 'True Resurrection']
  },
  Druid: {
    0: ['Druidcraft', 'Guidance', 'Mending', 'Poison Spray', 'Produce Flame', 'Resistance', 'Shillelagh', 'Starry Wisp', 'Thorn Whip'],
    1: ['Animal Friendship', 'Charm Person', 'Create or Destroy Water', 'Cure Wounds', 'Detect Magic', 'Detect Poison and Disease', 'Entangle', 'Faerie Fire', 'Fog Cloud', 'Goodberry', 'Healing Word', 'Jump', 'Longstrider', 'Purify Food and Drink', 'Speak with Animals', 'Thunderwave'],
    2: ['Animal Messenger', 'Barkskin', 'Beast Sense', 'Darkvision', 'Enhance Ability', 'Find Traps', 'Flame Blade', 'Flaming Sphere', 'Gust of Wind', 'Heat Metal', 'Hold Person', 'Lesser Restoration', 'Locate Animals or Plants', 'Locate Object', 'Moonbeam', 'Pass without Trace', 'Protection from Poison', 'Spike Growth'],
    3: ['Call Lightning', 'Conjure Animals', 'Daylight', 'Dispel Magic', 'Feign Death', 'Meld into Stone', 'Plant Growth', 'Protection from Energy', 'Sleet Storm', 'Speak with Plants', 'Water Breathing', 'Water Walk', 'Wind Wall'],
    4: ['Blight', 'Confusion', 'Control Water', 'Dominate Beast', 'Freedom of Movement', 'Giant Insect', 'Grasping Vine', 'Hallucinatory Terrain', 'Ice Storm', 'Locate Creature', 'Polymorph', 'Stone Shape', 'Stoneskin', 'Wall of Fire'],
    5: ['Antilife Shell', 'Awaken', 'Commune with Nature', 'Conjure Elemental', 'Contagion', 'Geas', 'Greater Restoration', 'Insect Plague', 'Mass Cure Wounds', 'Planar Binding', 'Reincarnate', 'Scrying', 'Tree Stride', 'Wall of Stone'],
    6: ['Conjure Fey', 'Find the Path', 'Heal', "Heroes' Feast", 'Move Earth', 'Sunbeam', 'Transport via Plants', 'Wall of Thorns', 'Wind Walk'],
    7: ['Fire Storm', 'Mirage Arcane', 'Plane Shift', 'Regenerate', 'Reverse Gravity'],
    8: ['Animal Shapes', 'Antipathy/Sympathy', 'Control Weather', 'Earthquake', 'Sunburst', 'Tsunami'],
    9: ['Foresight', 'Shapechange', 'Storm of Vengeance', 'True Resurrection']
  },
  Paladin: {
    1: ['Bless', 'Command', 'Compelled Duel', 'Cure Wounds', 'Detect Evil and Good', 'Detect Magic', 'Detect Poison and Disease', 'Divine Favor', 'Heroism', 'Protection from Evil and Good', 'Purify Food and Drink', 'Searing Smite', 'Shield of Faith', 'Thunderous Smite', 'Wrathful Smite'],
    2: ['Aid', 'Branding Smite', 'Find Steed', 'Lesser Restoration', 'Locate Object', 'Magic Weapon', 'Protection from Poison', 'Zone of Truth'],
    3: ['Aura of Vitality', 'Blinding Smite', 'Create Food and Water', 'Daylight', 'Dispel Magic', 'Magic Circle', 'Remove Curse', 'Revivify'],
    4: ['Aura of Life', 'Aura of Purity', 'Banishment', 'Death Ward', 'Locate Creature', 'Staggering Smite'],
    5: ['Banishing Smite', 'Circle of Power', 'Destructive Wave', 'Dispel Evil and Good', 'Geas', 'Raise Dead']
  },
  Ranger: {
    1: ['Alarm', 'Animal Friendship', 'Cure Wounds', 'Detect Magic', 'Detect Poison and Disease', 'Ensnaring Strike', 'Entangle', 'Fog Cloud', 'Goodberry', 'Hail of Thorns', "Hunter's Mark", 'Jump', 'Longstrider', 'Speak with Animals'],
    2: ['Animal Messenger', 'Barkskin', 'Beast Sense', 'Cordon of Arrows', 'Darkvision', 'Find Traps', 'Lesser Restoration', 'Locate Animals or Plants', 'Locate Object', 'Pass without Trace', 'Protection from Poison', 'Silence', 'Spike Growth'],
    3: ['Conjure Animals', 'Conjure Barrage', 'Daylight', 'Lightning Arrow', 'Nondetection', 'Plant Growth', 'Protection from Energy', 'Speak with Plants', 'Water Breathing', 'Water Walk', 'Wind Wall'],
    4: ['Conjure Woodland Beings', 'Freedom of Movement', 'Grasping Vine', 'Locate Creature', 'Stoneskin'],
    5: ['Commune with Nature', 'Conjure Volley', 'Swift Quiver', 'Tree Stride']
  },
  Sorcerer: {
    0: ['Acid Splash', 'Blade Ward', 'Chill Touch', 'Dancing Lights', 'Fire Bolt', 'Friends', 'Light', 'Mage Hand', 'Message', 'Minor Illusion', 'Poison Spray', 'Prestidigitation', 'Ray of Frost', 'Shocking Grasp', 'Sorcerous Burst', 'True Strike'],
    1: ['Burning Hands', 'Charm Person', 'Chaos Bolt', 'Chromatic Orb', 'Color Spray', 'Comprehend Languages', 'Detect Magic', 'Disguise Self', 'Expeditious Retreat', 'False Life', 'Feather Fall', 'Fog Cloud', 'Grease', 'Jump', 'Mage Armor', 'Magic Missile', 'Ray of Sickness', 'Shield', 'Silent Image', 'Sleep', 'Thunderwave', 'Witch Bolt'],
    2: ['Alter Self', 'Blindness/Deafness', 'Blur', 'Cloud of Daggers', 'Crown of Madness', 'Darkness', 'Darkvision', 'Detect Thoughts', "Dragon's Breath", 'Enhance Ability', 'Enlarge/Reduce', 'Gust of Wind', 'Hold Person', 'Invisibility', 'Knock', 'Levitate', 'Mirror Image', 'Misty Step', 'Phantasmal Force', 'Scorching Ray', 'Shatter', 'Spider Climb', 'Suggestion', 'Web'],
    3: ['Blink', 'Clairvoyance', 'Counterspell', 'Daylight', 'Dispel Magic', 'Fear', 'Fireball', 'Fly', 'Gaseous Form', 'Haste', 'Hypnotic Pattern', 'Lightning Bolt', 'Major Image', 'Protection from Energy', 'Sleet Storm', 'Slow', 'Stinking Cloud', 'Tongues', 'Vampiric Touch', 'Water Breathing', 'Water Walk'],
    4: ['Banishment', 'Blight', 'Charm Monster', 'Confusion', 'Dimension Door', 'Dominate Beast', 'Greater Invisibility', 'Ice Storm', 'Polymorph', 'Stoneskin', 'Wall of Fire'],
    5: ['Animate Objects', 'Cloudkill', 'Cone of Cold', 'Creation', 'Dominate Person', 'Hold Monster', 'Insect Plague', 'Seeming', 'Telekinesis', 'Teleportation Circle', 'Wall of Stone'],
    6: ['Arcane Gate', 'Chain Lightning', 'Circle of Death', 'Disintegrate', 'Eyebite', 'Globe of Invulnerability', 'Mass Suggestion', 'Move Earth', 'Sunbeam', 'True Seeing'],
    7: ['Delayed Blast Fireball', 'Etherealness', 'Finger of Death', 'Fire Storm', 'Plane Shift', 'Prismatic Spray', 'Reverse Gravity', 'Teleport'],
    8: ["Abi-Dalzim's Horrid Wilting", 'Dominate Monster', 'Earthquake', 'Incendiary Cloud', 'Power Word Stun', 'Sunburst'],
    9: ['Gate', 'Meteor Swarm', 'Power Word Kill', 'Time Stop', 'Wish']
  },
  Warlock: {
    0: ['Blade Ward', 'Chill Touch', 'Eldritch Blast', 'Friends', 'Mage Hand', 'Minor Illusion', 'Poison Spray', 'Prestidigitation', 'True Strike'],
    1: ['Armor of Agathys', 'Arms of Hadar', 'Charm Person', 'Comprehend Languages', 'Expeditious Retreat', 'Hellish Rebuke', 'Hex', 'Illusory Script', 'Protection from Evil and Good', 'Unseen Servant', 'Witch Bolt'],
    2: ['Cloud of Daggers', 'Crown of Madness', 'Darkness', 'Enthrall', 'Hold Person', 'Invisibility', 'Mirror Image', 'Misty Step', 'Ray of Enfeeblement', 'Shatter', 'Spider Climb', 'Suggestion'],
    3: ['Counterspell', 'Dispel Magic', 'Fear', 'Fly', 'Gaseous Form', 'Hunger of Hadar', 'Hypnotic Pattern', 'Magic Circle', 'Major Image', 'Remove Curse', 'Tongues', 'Vampiric Touch'],
    4: ['Banishment', 'Blight', 'Dimension Door', 'Hallucinatory Terrain', 'Sickening Radiance'],
    5: ['Contact Other Plane', 'Dream', 'Hold Monster', 'Scrying', 'Synaptic Static', 'Wall of Light'],
    6: ['Arcane Gate', 'Circle of Death', 'Conjure Fey', 'Create Undead', 'Eyebite', 'Flesh to Stone', 'Mass Suggestion', 'Mental Prison', 'Scatter', 'Soul Cage', 'True Seeing'],
    7: ['Crown of Stars', 'Etherealness', 'Finger of Death', 'Forcecage', 'Plane Shift', 'Power Word Pain'],
    8: ['Demiplane', 'Dominate Monster', 'Feeblemind', 'Glibness', 'Maddening Darkness', 'Power Word Stun'],
    9: ['Astral Projection', 'Blade of Disaster', 'Foresight', 'Gate', 'Imprisonment', 'Power Word Kill', 'Psychic Scream', 'Shapechange', 'True Polymorph', 'Weird']
  },
  Wizard: {
    0: ['Acid Splash', 'Blade Ward', 'Chill Touch', 'Dancing Lights', 'Fire Bolt', 'Light', 'Mage Hand', 'Message', 'Minor Illusion', 'Poison Spray', 'Prestidigitation', 'Ray of Frost', 'Shocking Grasp', 'Toll the Dead', 'True Strike'],
    1: ['Alarm', 'Burning Hands', 'Charm Person', 'Chromatic Orb', 'Color Spray', 'Comprehend Languages', 'Detect Magic', 'Disguise Self', 'Expeditious Retreat', 'False Life', 'Feather Fall', 'Find Familiar', 'Fog Cloud', 'Grease', 'Identify', 'Illusory Script', 'Jump', 'Longstrider', 'Mage Armor', 'Magic Missile', 'Protection from Evil and Good', 'Ray of Sickness', 'Shield', 'Silent Image', 'Sleep', "Tasha's Hideous Laughter", 'Thunderwave', 'Unseen Servant', 'Witch Bolt'],
    2: ['Acid Arrow', 'Alter Self', 'Arcane Lock', 'Augury', 'Blindness/Deafness', 'Blur', 'Cloud of Daggers', 'Continual Flame', 'Crown of Madness', 'Darkness', 'Darkvision', 'Detect Thoughts', "Dragon's Breath", 'Enlarge/Reduce', 'Flaming Sphere', 'Gentle Repose', 'Gust of Wind', 'Hold Person', 'Invisibility', 'Knock', 'Levitate', 'Locate Object', 'Magic Weapon', 'Mirror Image', 'Misty Step', "Nystul's Magic Aura", 'Phantasmal Force', 'Ray of Enfeeblement', 'Rope Trick', 'Scorching Ray', 'See Invisibility', 'Shatter', 'Spider Climb', 'Suggestion', 'Web'],
    3: ['Animate Dead', 'Bestow Curse', 'Blink', 'Clairvoyance', 'Counterspell', 'Dispel Magic', 'Fear', 'Feign Death', 'Fireball', 'Fly', 'Gaseous Form', 'Glyph of Warding', 'Haste', 'Hypnotic Pattern', "Leomund's Tiny Hut", 'Lightning Bolt', 'Magic Circle', 'Major Image', 'Nondetection', 'Phantom Steed', 'Protection from Energy', 'Remove Curse', 'Sending', 'Sleet Storm', 'Slow', 'Stinking Cloud', 'Tongues', 'Vampiric Touch', 'Water Breathing'],
    4: ['Arcane Eye', 'Banishment', 'Blight', 'Charm Monster', 'Confusion', 'Control Water', 'Dimension Door', "Evard's Black Tentacles", 'Fabricate', 'Fire Shield', 'Greater Invisibility', 'Hallucinatory Terrain', 'Ice Storm', "Leomund's Secret Chest", 'Locate Creature', "Mordenkainen's Faithful Hound", "Mordenkainen's Private Sanctum", "Otiluke's Resilient Sphere", 'Phantasmal Killer', 'Polymorph', 'Stone Shape', 'Stoneskin', 'Wall of Fire'],
    5: ['Animate Objects', "Bigby's Hand", 'Cloudkill', 'Cone of Cold', 'Conjure Elemental', 'Contact Other Plane', 'Creation', 'Dominate Person', 'Dream', 'Geas', 'Hold Monster', 'Legend Lore', 'Mislead', 'Modify Memory', 'Passwall', 'Planar Binding', "Rary's Telepathic Bond", 'Scrying', 'Seeming', 'Telekinesis', 'Teleportation Circle', 'Transmute Rock', 'Wall of Force', 'Wall of Stone'],
    6: ['Arcane Gate', 'Chain Lightning', 'Circle of Death', 'Contingency', 'Create Undead', 'Disintegrate', "Drawmij's Instant Summons", 'Eyebite', 'Flesh to Stone', 'Globe of Invulnerability', 'Guards and Wards', 'Magic Jar', 'Mass Suggestion', 'Move Earth', "Otto's Irresistible Dance", 'Programmed Illusion', 'Sunbeam', 'True Seeing', 'Wall of Ice'],
    7: ['Delayed Blast Fireball', 'Etherealness', 'Finger of Death', 'Forcecage', 'Mirage Arcane', "Mordenkainen's Magnificent Mansion", "Mordenkainen's Sword", 'Plane Shift', 'Prismatic Spray', 'Project Image', 'Reverse Gravity', 'Sequester', 'Simulacrum', 'Symbol', 'Teleport'],
    8: ["Abi-Dalzim's Horrid Wilting", 'Antimagic Field', 'Antipathy/Sympathy', 'Clone', 'Control Weather', 'Demiplane', 'Dominate Monster', 'Feeblemind', 'Incendiary Cloud', 'Maze', 'Mind Blank', 'Power Word Stun', 'Sunburst', 'Telepathy'],
    9: ['Astral Projection', 'Blade of Disaster', 'Foresight', 'Gate', 'Imprisonment', 'Meteor Swarm', 'Power Word Kill', 'Prismatic Wall', 'Shapechange', 'Time Stop', 'True Polymorph', 'Weird', 'Wish']
  }
};
const ALL_SKILLS = ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'];
const TOOLS = ["Alchemist's Supplies", "Brewer's Supplies", "Calligrapher's Supplies", "Carpenter's Tools", "Cartographer's Tools", "Cobbler's Tools", "Cook's Utensils", "Glassblower's Tools", "Jeweler's Tools", "Leatherworker's Tools", "Mason's Tools", "Painter's Supplies", "Potter's Tools", "Smith's Tools", "Tinker's Tools", "Weaver's Tools", "Woodcarver's Tools"];
const INSTRUMENTS = ['Bagpipes', 'Drum', 'Dulcimer', 'Flute', 'Lute', 'Lyre', 'Horn', 'Pan Flute', 'Shawm', 'Viol'];
const FIGHTING_STYLES = ['Archery', 'Defense', 'Dueling', 'Great Weapon Fighting', 'Protection', 'Two-Weapon Fighting', 'Interception', 'Thrown Weapon Fighting', 'Unarmed Fighting', 'Blind Fighting'];
const WEAPONS_LIST = ['Battleaxe', 'Dagger', 'Flail', 'Glaive', 'Greataxe', 'Greatsword', 'Halberd', 'Hand Crossbow', 'Handaxe', 'Heavy Crossbow', 'Javelin', 'Lance', 'Light Hammer', 'Longbow', 'Longsword', 'Maul', 'Morningstar', 'Musket', 'Pike', 'Pistol', 'Rapier', 'Scimitar', 'Shortbow', 'Shortsword', 'Trident', 'War Pick', 'Warhammer', 'Whip'];
const METAMAGIC_OPTIONS = ['Careful Spell', 'Distant Spell', 'Empowered Spell', 'Extended Spell', 'Heightened Spell', 'Quickened Spell', 'Seeking Spell', 'Subtle Spell', 'Transmuted Spell', 'Twinned Spell'];
const FEATS = ['Alert', 'Charger', 'Crossbow Expert', 'Defensive Duelist', 'Dual Wielder', 'Durable', 'Elemental Adept', 'Grappler', 'Great Weapon Master', 'Healer', 'Heavy Armor Master', 'Inspiring Leader', 'Mage Slayer', 'Magic Initiate', 'Martial Weapon Master', 'Medium Armor Master', 'Mounted Combatant', 'Observant', 'Polearm Master', 'Resilient', 'Ritual Caster', 'Sentinel', 'Sharpshooter', 'Shield Master', 'Skill Expert', 'Skulker', 'Speedy', 'Spell Sniper', 'Tough', 'War Caster', 'Weapon Master'];

const NAMES: Record<string, string[]> = {
  Human: ['Aric', 'Bryn', 'Cora', 'Dain', 'Elara', 'Finn', 'Galen', 'Iris'],
  Aasimar: ['Aurelia', 'Cassiel', 'Elys', 'Iriel', 'Liora', 'Seraph', 'Theron', 'Vanya'],
  Elf: ['Aelar', 'Lia', 'Thamior', 'Sylra', 'Varis', 'Naeris', 'Faelar', 'Shava'],
  Dwarf: ['Borin', 'Helja', 'Rurik', 'Sigrid', 'Torin', 'Gilda', 'Hilda', 'Karrak'],
  Halfling: ['Pip', 'Rosie', 'Milo', 'Tilly', 'Jory', 'Nessa', 'Wren', 'Lyle'],
  Gnome: ['Fizz', 'Nim', 'Tock', 'Brix', 'Mara', 'Lilli', 'Zook', 'Pexa'],
  Dragonborn: ['Arjhan', 'Kava', 'Rhogar', 'Sora', 'Medrash', 'Korrin', 'Balasar', 'Akra'],
  Tiefling: ['Zara', 'Kael', 'Nyx', 'Vex', 'Malik', 'Riven', 'Lilith', 'Thera'],
  Orc: ['Grom', 'Vasha', 'Thok', 'Korga', 'Ugra', 'Brek', 'Mira', 'Jara'],
  Goliath: ['Brakka', 'Dorra', 'Kothar', 'Mavri', 'Toram', 'Varka', 'Yorin', 'Zorla']
};

const SURNAMES = ['Brightwood', 'Ironfist', 'Stormwind', 'Duskwalker', 'Ashcroft', 'Ravenwood', 'Stonehelm', 'Moonfall'];

const ABILITY_KEYS: AbilityKey[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

const randomItem = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const shuffle = <T>(items: T[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const sample = <T>(items: T[], count: number) => shuffle(items).slice(0, Math.min(items.length, count));

const roll4d6DropLowest = () => {
  const rolls = [1, 2, 3, 4].map(() => Math.floor(Math.random() * 6) + 1).sort((a, b) => a - b);
  return rolls[1] + rolls[2] + rolls[3];
};

const buildModifiers = (scores: AbilityScores): AbilityScores => ({
  STR: Math.floor((scores.STR - 10) / 2),
  DEX: Math.floor((scores.DEX - 10) / 2),
  CON: Math.floor((scores.CON - 10) / 2),
  INT: Math.floor((scores.INT - 10) / 2),
  WIS: Math.floor((scores.WIS - 10) / 2),
  CHA: Math.floor((scores.CHA - 10) / 2)
});

const getAsiLevels = (className: string) => {
  const levels = [4, 8, 12, 16, 19];
  if (className === 'Fighter') levels.push(6, 14);
  if (className === 'Rogue') levels.push(10);
  return levels.sort((a, b) => a - b);
};
const buildOriginFeatDetail = (feat: string, selectedSkills: string[]) => {
  if (feat === 'Skilled') {
    const available = ALL_SKILLS.filter(skill => !selectedSkills.includes(skill));
    return `Skilled: ${sample(available, 3).join(', ')}`;
  }
  if (feat === 'Musician') {
    return `Musician: ${sample(INSTRUMENTS, 3).join(', ')}`;
  }
  if (feat === 'Crafter') {
    return `Crafter: ${sample(TOOLS, 3).join(', ')}`;
  }
  if (feat.startsWith('Magic Initiate')) {
    const className = feat.split('(')[1]?.replace(')', '') ?? '';
    const miniDb: Record<string, { c: string[]; l1: string[] }> = {
      Cleric: { c: ['Guidance', 'Light', 'Sacred Flame'], l1: ['Bless', 'Cure Wounds', 'Healing Word'] },
      Druid: { c: ['Druidcraft', 'Shillelagh', 'Thorn Whip'], l1: ['Entangle', 'Goodberry', 'Thunderwave'] },
      Wizard: { c: ['Fire Bolt', 'Mage Hand', 'Minor Illusion'], l1: ['Magic Missile', 'Shield', 'Sleep'] }
    };
    if (miniDb[className]) {
      const picks = miniDb[className];
      const cantrips = sample(picks.c, 2);
      const level1 = sample(picks.l1, 1);
      return `Spells: ${cantrips.join(', ')} + ${level1[0]}`;
    }
  }
  return '';
};

const buildSpells = (className: string, classData: ClassData, level: number, extraCantrip: boolean) => {
  const classSpellList = CLASS_SPELLS[className];
  if (!classData.caster || !classSpellList) return [];

  let highestSlot = 0;
  if (['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Wizard'].includes(className)) {
    highestSlot = Math.min(9, Math.floor((level + 1) / 2));
  } else if (['Paladin', 'Ranger'].includes(className)) {
    if (level >= 2) {
      highestSlot = Math.min(5, Math.floor((level + 1) / 4));
    } else if (level === 1) {
      highestSlot = 1;
    }
  } else if (className === 'Warlock') {
    highestSlot = Math.min(5, Math.floor((level + 1) / 2));
  }

  const spells: string[] = [];
  if (classSpellList[0]) {
    let cantripCount = className === 'Bard' ? 2 : 3;
    if (className === 'Druid') {
      cantripCount = 2 + (extraCantrip ? 1 : 0);
    }
    spells.push(`Cantrips: ${sample(classSpellList[0], cantripCount).join(', ')}`);
  }
  for (let i = 1; i <= highestSlot; i++) {
    if (classSpellList[i]) {
      if (className === 'Druid' && i === 1) {
        spells.push('Choose spells to prepare for the dungeon.');
        continue;
      }
      spells.push(`Level ${i}: ${sample(classSpellList[i], 2).join(', ')}`);
    }
  }

  if (className === 'Warlock' && level >= 11 && classSpellList[6]) {
    spells.push(`Mystic Arcanum: ${randomItem(classSpellList[6])}`);
  }

  return spells;
};

const buildClassInputs = (className: string, classSkills: string[], level: number) => {
  const inputs: string[] = [`${className} Skill Proficiencies: ${classSkills.join(', ')}`];
  let extraCantrip = false;

  if (className === 'Cleric') {
    inputs.push(`Divine Order: ${randomItem(['Protector (Heavy Armor)', 'Thaumaturge (Extra Cantrip)'])}`);
  }
  if (className === 'Druid') {
    const primalOrder = randomItem(['Magician (Extra Cantrip)', 'Warden (Medium Armor)']);
    inputs.push(`Primal Order: ${primalOrder}`);
    if (primalOrder.startsWith('Magician')) {
      extraCantrip = true;
    }
  }
  if (className === 'Bard') {
    inputs.push(`Musical Instruments: ${sample(INSTRUMENTS, 3).join(', ')}`);
  }
  if (className === 'Monk') {
    if (Math.random() < 0.5) {
      inputs.push(`Musical Instrument: ${randomItem(INSTRUMENTS)}`);
    } else {
      inputs.push(`Artisan's Tools: ${randomItem(TOOLS)}`);
    }
  }

  const hasFightingStyle =
    (className === 'Fighter' && level >= 1) ||
    (['Paladin', 'Ranger'].includes(className) && level >= 2);
  if (hasFightingStyle) {
    inputs.push(`Fighting Style: ${randomItem(FIGHTING_STYLES)}`);
  }

  let masteryCount = 0;
  if (className === 'Barbarian') masteryCount = 2;
  if (className === 'Fighter') {
    masteryCount = level < 4 ? 3 : level < 10 ? 4 : level < 16 ? 5 : 6;
  }
  if (['Monk', 'Paladin', 'Ranger', 'Rogue'].includes(className)) masteryCount = 2;
  if (masteryCount > 0) {
    inputs.push(`Weapon Mastery: ${sample(WEAPONS_LIST, masteryCount).join(', ')}`);
  }

  if (className === 'Sorcerer' && level >= 2) {
    const count = level >= 17 ? 6 : level >= 10 ? 4 : 2;
    inputs.push(`Metamagic (${count}): ${sample(METAMAGIC_OPTIONS, count).join(', ')}`);
  }

  return { inputs, extraCantrip };
};

const buildSpeciesInputs = (speciesName: string) => {
  if (speciesName === 'Elf') {
    const keenChoice = randomItem(['Insight', 'Survival', 'Perception']);
    return [`Keen Senses: ${keenChoice}`];
  }
  return [];
};
const applyBackgroundBoosts = (scores: AbilityScores, classData: ClassData, background: BackgroundData) => {
  const priority = [...classData.primary, ...ABILITY_KEYS.filter((key) => !classData.primary.includes(key))];
  let plus2: AbilityKey | undefined;
  let plus1: AbilityKey | undefined;

  for (const ability of priority) {
    if (!background.stats.includes(ability)) continue;
    if (!plus2) {
      plus2 = ability;
      continue;
    }
    if (!plus1 && ability !== plus2) {
      plus1 = ability;
      break;
    }
  }

  if (!plus2) plus2 = background.stats[0];
  if (!plus1) plus1 = background.stats.find((stat) => stat !== plus2) ?? plus2;

  scores[plus2] += 2;
  scores[plus1] += 1;

  return { plus2, plus1 };
};

const applyAsiProgression = (scores: AbilityScores, className: string, classData: ClassData, level: number) => {
  const asiLevels = getAsiLevels(className).filter((lvl) => lvl <= level);
  const primary = classData.primary[0];
  const secondary = classData.primary[1] ?? 'CON';

  asiLevels.forEach(() => {
    if (OPTIMIZE_STATS && scores[primary] < 20) {
      const increase = Math.min(2, 20 - scores[primary]);
      scores[primary] += increase;
      if (increase === 1 && scores[secondary] < 20) {
        scores[secondary] += 1;
      }
      return;
    }

    if (Math.random() < 0.5) {
      randomItem(FEATS);
      return;
    }

    const increase = scores[primary] <= 18 ? 2 : 1;
    scores[primary] = Math.min(20, scores[primary] + increase);
  });
};

export const generateCharacter = (levelInput?: number, classOverride?: string): GeneratedCharacter => {
  const level = Math.max(1, Math.min(20, Math.round(levelInput ?? 1)));
  const className = classOverride && CLASSES[classOverride] ? classOverride : randomItem(CLASS_NAMES);
  const classData = CLASSES[className];
  const backgroundName = randomItem(Object.keys(BACKGROUNDS));
  const background = BACKGROUNDS[backgroundName];
  const speciesName = randomItem(Object.keys(SPECIES_DATA));
  const ancestryOptions = SPECIES_DATA[speciesName];
  const ancestry = ancestryOptions.length ? randomItem(ancestryOptions) : undefined;

  const abilityScores = ABILITY_KEYS.reduce((acc, key) => {
    acc[key] = roll4d6DropLowest();
    return acc;
  }, {} as AbilityScores);

  const backgroundBoosts = applyBackgroundBoosts(abilityScores, classData, background);
  applyAsiProgression(abilityScores, className, classData, level);

  const modifiers = buildModifiers(abilityScores);

  const skillCount = className === 'Rogue' ? 4 : className === 'Bard' ? 3 : 2;
  const classSkills = sample(classData.skills, skillCount);

  const classInputResult = buildClassInputs(className, classSkills, level);
  const spells = buildSpells(className, classData, level, classInputResult.extraCantrip);
  const speciesInputs = buildSpeciesInputs(speciesName);

  const originFeatDetail = buildOriginFeatDetail(background.feat, classSkills);

  const otherLangs = LANGUAGES.filter((lang) => lang !== 'Common');
  const languages = ['Common', ...sample(otherLangs, 2)];

  const subclass = level >= 3 ? randomItem(classData.subclasses) : undefined;

  return {
    name: `${randomItem(NAMES[speciesName] ?? NAMES.Human)} ${randomItem(SURNAMES)}`,
    className,
    subclass,
    level,
    classInputs: classInputResult.inputs,
    spells,
    background: backgroundName,
    backgroundBoosts,
    originFeat: background.feat,
    originFeatDetail,
    backgroundSkillProficiencies: background.skillProficiencies ?? [],
    species: speciesName,
    ancestry,
    speciesInputs,
    languages,
    abilityScores,
    modifiers
  };
};
