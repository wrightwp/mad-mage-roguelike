# AI Room Prompt Guide

Guide for creating prompts to generate battle maps for D&D Beyond VTT.

## Base Prompt Template

```
Top-down bird's eye view battle map for tabletop RPG with 5ft square grid overlay. [SIZE] underground dungeon room with stone walls. [LIGHTING]. [KEY_FEATURES]. [TERRAIN]. [ENTRANCE]. [EXITS]. Clean lines, high contrast for virtual tabletop use.
```

> [!IMPORTANT]
> **All maps are underground dungeon rooms** - they must have visible walls enclosing the space with clear entrance/exit points. Entrance points do not need to be on the walls, depending on the encounter type.


---

## Required Elements

### Size
- Small: 60-100ft (single encounter)
- Medium: 100-150ft (standard encounter)
- Large: 150-200ft (complex encounter)
- Huge: 200-400ft (multi-room or boss)

### Grid
**Always include:** "with 5ft grid squares" or "with 5ft grid"

### Lighting
- `Torchlight` - warm orange glow
- `Dim light` - shadowy, atmospheric
- `Bright light` - well-lit, clear visibility
- `Magical glow` - unnatural colors (green, purple, blue)
- `Bioluminescent` - organic, fungal lighting
- `No light sources` - for darkvision encounters

### Entrance (Required)

Every room needs an entrance. The entrance doesn't have to be a door on the side—it can be any logical entry point:

| Entrance Type | Description |
|---------------|-------------|
| Standard door | Doorway on wall edge |
| Well/shaft | Vertical drop from above (center or corner) |
| Crevasse/fissure | Climb down into room |
| Collapsed floor | Hole from level above |
| Tunnel opening | Natural cave entrance |
| Portal/gate | Magical entry point |
| Ladder/stairs | Vertical access point |
| Trapdoor | Floor hatch entry |

**Example phrasing:**
- "Entry via 10ft wide crevasse in the ceiling center"
- "Entrance through collapsed floor in northwest corner"
- "Spiral staircase entrance at south end"

### Exits (Based on Encounter Connections)

The number of exits should match the encounter's `size` field (number of connected rooms):

| Size Value | Exit Description |
|------------|------------------|
| 1 | "One exit" or "Single exit opposite entrance" |
| 2 | "Two exits on opposite sides" |
| 3 | "Three exits spread across walls" |
| 4+ | "Multiple exits around the perimeter" |

**Exit placement options:**
- `opposite the entrance`
- `on adjacent walls`
- `spread across walls`
- `on elevated platforms`
- `behind obstacles/hazards`

---

## Room Types

| Type | Description |
|------|-------------|
| Stone dungeon | Classic underground corridors |
| Natural cave/cavern | Organic rock formations |
| Crypt/tomb | Burial chambers, sarcophagi |
| Temple/shrine | Religious iconography |
| Sewer/tunnel | Water channels, grates |
| Mine | Wooden supports, ore veins |
| Lair/den | Animal nest materials |
| Ruins | Broken pillars, collapsed walls |
| Frozen cavern | Ice, frost, icicles |
| Volcanic cave | Lava, obsidian, heat vents |

---

## Terrain Features

### Cover
- `Low walls (half cover)`
- `Pillars/columns`
- `Overturned furniture`
- `Rock formations`
- `Crates and barrels`

### Difficult Terrain
- `Shallow water`
- `Rubble/debris`
- `Thick webs`
- `Dense vegetation`
- `Ice patches`
- `Loose gravel`

### Elevation
- `10ft raised platform`
- `Stairs/ramps`
- `Balcony overlooking`
- `Pit/depression (Xft deep)`
- `Ledges along walls`

### Hazards
- `Lava pools`
- `Spike pits`
- `Pendulum blades`
- `Pressure plates`
- `Collapsing floor sections`

---

## Example Prompts

### Basic Dungeon Room
```
Top-down bird's eye view battle map for tabletop RPG with 5ft square grid overlay. 100ft x 80ft underground dungeon chamber with stone walls. Torchlight from wall sconces. Stone pillars provide cover. Debris scattered on floor. Entry via stone archway at south. Two exits on opposite walls. Clean lines, high contrast for virtual tabletop use.
```

### Spider Lair
```
Top-down bird's eye view battle map for tabletop RPG with 5ft square grid overlay. 140ft x 120ft underground dungeon cavern with rough stone walls. Dim bioluminescent lighting. Dense spider webs covering 60% of floor (difficult terrain). Multiple cocoons visible from above. Narrow clear paths between web masses. Entry via tunnel at south. Two exits on opposite corners. Clean lines, high contrast for virtual tabletop use.
```

### Flooded Temple
```
Top-down bird's eye view battle map for tabletop RPG with 5ft square grid overlay. 120ft x 100ft underground flooded temple with carved stone walls. Magical blue-green glow from underwater. Shallow water (difficult terrain) throughout. Raised altar platform (5ft high) in center. Broken statues and pillars. Entry via stairs descending from above. Three exits spread across walls. Clean lines, high contrast for virtual tabletop use.
```

### Volcanic Vent
```
Top-down bird's eye view battle map for tabletop RPG with 5ft square grid overlay. 100ft x 100ft underground volcanic cave with dark stone walls. Orange glow from lava vents. Lava pools (hazard) in corners. Obsidian formations. Safe stone pathways between hazards. Entry via fissure at south. Single exit opposite entrance. Clean lines, high contrast for virtual tabletop use.
```

---

## Tips for Better Results

1. **Be specific about dimensions** - "100ft x 80ft" not "medium sized"
2. **Always mention the grid** - Essential for VTT use
3. **Describe lighting first** - Sets the mood
4. **List features in order of importance** - Most critical elements first
5. **Specify number of exits** - Important for tactical play
6. **End with style guidance** - "Top-down view, clean lines, high contrast for VTT use"

## Style Modifiers

Add these for specific aesthetics:
- `Dark fantasy style`
- `Detailed linework`
- `Muted earth tones`
- `High detail`
- `Painterly style`
- `Realistic textures`
