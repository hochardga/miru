# Source Material Audit

This audit covers the files currently under `docs/source`.

## Summary

- Total files: 51
- Total size: about 35 MB
- File types: 3 PDFs, 48 PNGs
- Main folders:
  - `miru1v2e`: updated Miru 1 v2e PDFs plus print-ready map and character sheet PNGs, about 33 MB
  - `digital_tokens`: digital play aids, map tiles, counters, icons, and token images, about 1.6 MB

## Duplication Notes

- No exact duplicate files were found by SHA-256 hash. Every file has unique bytes.
- Remaining PDF duplication is export/layout duplication: the v2e core book appears as a searchable spread-oriented PDF, a searchable single-page PDF, and a low-ink booklet PDF.
- `miru1v2e/miru1v2e.pdf` and `miru1v2e/miru1v2e_singlepg.pdf` contain effectively the same text. Extracted word sets were about 98.3% similar; the difference appears to be layout/page-flow rather than content.
- `miru1v2e/miru1v2e_lowink_booklet.pdf` appears to be a low-ink booklet export of the same v2e book, but it is image-only, so text could not be compared directly.
- Marker and token PNGs intentionally repeat the same shapes in different colors. These are variants, not accidental duplicates.
- The `miru1_map tiles` and `miru2_map tiles` folders contain the same terrain categories, but the art dimensions and hashes differ.
- `digital_tokens/icon_enemy02.png` and `digital_tokens/icon_enemy_god.png` are visually very similar and have the same file size, but they are not exact duplicates.

## PDF Manifest

| File | Size | Pages | Page size | Text extraction | Contents |
| --- | ---: | ---: | --- | --- | --- |
| `miru1v2e/miru1v2e.pdf` | 6.7 MB | 31 | mixed A5/spread pages | 31/31 pages | Searchable Miru 1 v2e core book. Extracted table of contents includes introduction, basics of play, map exploration, combat and survival, terrain chapters, cutscenes, villages and quests, story choices, Impasse Garden, Cave of Shinda, map and character sheet, ending, item catalog, glossary, and challenge mode. |
| `miru1v2e/miru1v2e_lowink_booklet.pdf` | 19.1 MB | 30 | 841.9 x 595.3 pt | none | Low-ink booklet export of Miru 1 v2e. Image-only export. |
| `miru1v2e/miru1v2e_singlepg.pdf` | 6.7 MB | 60 | 419.5 x 595.3 pt | 60/60 pages | Searchable single-page layout of the Miru 1 v2e core book. Text is effectively the same as `miru1v2e/miru1v2e.pdf`. |

## Standalone PNG Sheets

| File | Size | Dimensions | Contents |
| --- | ---: | --- | --- |
| `miru1v2e/charactersheet_printreadyA4.png` | 458.1 KB | 2481 x 3508 px | A4 print-ready Miru 1 v2e character sheet. Includes character name, health/energy, base attack/defense, tools, weapons, wearables, treasures, misc, training skills, minor injuries, calendar, and number tracker. |
| `miru1v2e/map_printreadyA4.png` | 254.4 KB | 2481 x 3508 px | A4 print-ready blank hex map sheet with coordinate labels and compass. |
| `digital_tokens/Miru1_Spread_MapandCharacter.png` | 551.1 KB | 3497 x 2481 px | Miru 1 digital spread combining a blank map and character sheet/play area. |
| `digital_tokens/Miru2_Spread_mapandcharacter.png` | 628.5 KB | 3497 x 2481 px | Miru 2 digital spread combining a blank map and character sheet/play area. |

## Digital Token PNG Manifest

| File | Size | Dimensions | Contents |
| --- | ---: | --- | --- |
| `digital_tokens/Circle_marker_blue.png` | 1.6 KB | 73 x 72 px | Blue circular marker. |
| `digital_tokens/Circle_marker_green.png` | 1.6 KB | 73 x 72 px | Green circular marker. |
| `digital_tokens/Circle_marker_orange.png` | 1.6 KB | 73 x 72 px | Orange circular marker. |
| `digital_tokens/Circle_marker_purple.png` | 1.6 KB | 73 x 72 px | Purple circular marker. |
| `digital_tokens/Circle_marker_red.png` | 1.6 KB | 73 x 72 px | Red circular marker. |
| `digital_tokens/Circle_marker_yellow.png` | 1.6 KB | 73 x 72 px | Yellow circular marker. |
| `digital_tokens/Square_marker_blue.png` | 804 B | 65 x 65 px | Blue square marker. |
| `digital_tokens/Square_marker_green.png` | 815 B | 65 x 65 px | Green square marker. |
| `digital_tokens/Square_marker_orange.png` | 811 B | 65 x 65 px | Orange square marker. |
| `digital_tokens/Square_marker_purple.png` | 812 B | 65 x 65 px | Purple square marker. |
| `digital_tokens/Square_marker_red.png` | 815 B | 65 x 65 px | Red square marker. |
| `digital_tokens/Square_marker_yellow.png` | 812 B | 65 x 65 px | Yellow square marker. |
| `digital_tokens/TS_token_black.png` | 1.1 KB | 51 x 34 px | Black oval TS token, likely for training skill markers. |
| `digital_tokens/TS_token_blue.png` | 1.1 KB | 51 x 33 px | Blue oval TS token, likely for training skill markers. |
| `digital_tokens/TS_token_green.png` | 1.1 KB | 51 x 34 px | Green oval TS token, likely for training skill markers. |
| `digital_tokens/TS_token_orange.png` | 1.1 KB | 51 x 34 px | Orange oval TS token, likely for training skill markers. |
| `digital_tokens/TS_token_purple.png` | 1.1 KB | 51 x 34 px | Purple oval TS token, likely for training skill markers. |
| `digital_tokens/TS_token_red.png` | 1.1 KB | 51 x 34 px | Red oval TS token, likely for training skill markers. |
| `digital_tokens/TS_token_yellow.png` | 1.1 KB | 51 x 34 px | Yellow oval TS token, likely for training skill markers. |
| `digital_tokens/basenumberline.png` | 24.6 KB | 2224 x 244 px | Horizontal base number line graphic for tracking values. |
| `digital_tokens/icon_enemy01.png` | 2.2 KB | 100 x 100 px | Enemy icon 01: pixel-style enemy face on colored circular background. |
| `digital_tokens/icon_enemy02.png` | 2.2 KB | 100 x 100 px | Enemy icon 02: pixel-style enemy face on colored circular background. |
| `digital_tokens/icon_enemy03.png` | 2.2 KB | 100 x 100 px | Enemy icon 03: pixel-style enemy face on colored circular background. |
| `digital_tokens/icon_enemy05.png` | 2.2 KB | 100 x 100 px | Enemy icon 05: pixel-style enemy face on colored circular background. |
| `digital_tokens/icon_enemy4.png` | 2.2 KB | 100 x 100 px | Enemy icon 04. Filename is the only enemy file without a leading zero. |
| `digital_tokens/icon_enemy_god.png` | 2.2 KB | 100 x 100 px | God/boss enemy icon, visually similar to `digital_tokens/icon_enemy02.png` but not an exact duplicate. |
| `digital_tokens/icon_impassable.png` | 5.9 KB | 99 x 99 px | Impassable terrain icon: circled X symbol. |
| `digital_tokens/icon_treasure.png` | 2.2 KB | 100 x 100 px | Treasure/chest icon. |
| `digital_tokens/icon_village.png` | 7.3 KB | 100 x 109 px | Village/camp icon. |
| `digital_tokens/miru1_map tiles/map_desert.png` | 25.6 KB | 238 x 241 px | Miru 1 desert terrain map tile. |
| `digital_tokens/miru1_map tiles/map_forest.png` | 19.0 KB | 272 x 246 px | Miru 1 forest terrain map tile. |
| `digital_tokens/miru1_map tiles/map_grassland.png` | 14.4 KB | 238 x 241 px | Miru 1 grassland terrain map tile. |
| `digital_tokens/miru1_map tiles/map_mountain.png` | 22.7 KB | 244 x 243 px | Miru 1 mountain terrain map tile. |
| `digital_tokens/miru1_map tiles/map_swamp.png` | 19.1 KB | 238 x 241 px | Miru 1 swamp terrain map tile. |
| `digital_tokens/miru2_map tiles/map_desert.png` | 31.2 KB | 199 x 222 px | Miru 2 desert terrain map tile. |
| `digital_tokens/miru2_map tiles/map_forest.png` | 24.2 KB | 188 x 222 px | Miru 2 forest terrain map tile. |
| `digital_tokens/miru2_map tiles/map_grassland.png` | 18.6 KB | 197 x 222 px | Miru 2 grassland terrain map tile. |
| `digital_tokens/miru2_map tiles/map_mountain.png` | 26.8 KB | 184 x 206 px | Miru 2 mountain terrain map tile. |
| `digital_tokens/miru2_map tiles/map_swamp.png` | 25.8 KB | 188 x 222 px | Miru 2 swamp terrain map tile. |
| `digital_tokens/tracker_ep.png` | 2.8 KB | 104 x 235 px | EP vertical tracker card. |
| `digital_tokens/tracker_hp.png` | 2.6 KB | 103 x 180 px | HP vertical tracker card. |
| `digital_tokens/tracker_poison.png` | 3.2 KB | 104 x 224 px | Poison vertical tracker card. |
| `digital_tokens/tracker_sleepdep.png` | 3.0 KB | 104 x 180 px | Sleep deprivation vertical tracker card. |
| `digital_tokens/tracker_starvation.png` | 3.4 KB | 104 x 224 px | Starvation vertical tracker card. |

## Searchability And Usefulness

- Best source for searchable v2e text: `docs/source/miru1v2e/miru1v2e_singlepg.pdf` or `docs/source/miru1v2e/miru1v2e.pdf`.
- Best source for v2e print assets: `docs/source/miru1v2e/map_printreadyA4.png` and `docs/source/miru1v2e/charactersheet_printreadyA4.png`.
- Best source for digital tabletop play aids: `docs/source/digital_tokens`.

## Checks Performed

- Counted files and folder sizes under `docs/source`.
- Identified file types and image/PDF dimensions.
- Extracted PDF page counts and text availability with `pypdf`.
- Checked exact duplicates with SHA-256 hashes.
- Built a token contact sheet and spot-checked representative PDF thumbnails visually.
