# Miru Rules Requirements

This document captures the rules in `docs/source` as abstract software requirements for a future digital version of Miru. It intentionally avoids architecture, storage, UI framework, networking, or platform assumptions.

Primary source: `docs/source/miru1v2e/miru1v2e_singlepg.pdf`.

Supporting sources: `docs/source/miru1v2e/miru1v2e.pdf`, `docs/source/miru1v2e/*printreadyA4.png`, and `docs/source/digital_tokens/*`.

## Requirement Language

- "Must" means required by the source rules.
- "Should" means strongly implied by the source or needed to preserve playability.
- "May" means optional, variant, or convenience behavior.
- "Open issue" means the source text or extracted table is ambiguous and should be visually verified before implementation.

## Core Game Model

### Game Session

- The system must support a solo-first adventure game controlled by one main character.
- The system must track whether a session is active, won, dead-but-continuable, or ended.
- The win condition must be defeating The God.
- The setup state must initialize:
  - HP to 10.
  - EP to 10.
  - 3 Meal Bars.
  - Current day to Day 01.
  - Starting tile to any tile in row 01 of the map.
  - Character facing/map orientation so the compass points north.

### Player Character State

- The system must track current HP and EP.
- HP and EP must each have a normal maximum of 20.
- The system must track base ATK and base DEF, both starting at 1.
- The system must track inventory by item name and quantity.
- The system must distinguish food, tools, weapons, melee weapons, ranged weapons, wearables, tech skills, maps, scrap, and treasures.
- The system must track Bitliths as currency.
- The system must track starvation count.
- The system must track sleep deprivation count.
- The system must track minor injuries.
- The system must track known/unlocked Tech Skills and their training levels.
- The system must track calendar day progress and bold/story-event days.
- The system should support journal entries of 1-2 sentences per day.

### Map State

- The system must model the world as hex tiles.
- The map must support rows 01-12 and columns A-I, matching the print-ready map sheet.
- Each tile must be able to store:
  - Terrain type.
  - Visit status.
  - Icons: village, enemy, quest, treasure, impassable.
  - Event history and repeatability state.
  - Enemy state, including whether an enemy remains on the tile after escape.
  - Notes or discovered clues.
- The system must support six movement directions: W, NW, NE, E, SE, SW.
- The system must support the priority compass used when an instructed location/direction is inaccessible.
- The system must mark impassable tiles and prevent ordinary traversal through them.
- The system must support placing icons at relative coordinates from the current/focus tile.

## Turn Structure

### Daily Turn Routing

- The system must route each day according to tile state:
  - Blank new tile: move, roll terrain.
  - If terrain roll is 1: resolve small injury, then camp.
  - If terrain roll is 2-6: optionally roll weather, roll event, roll clarity where required, resolve event, then camp.
  - Tile with treasure, quest, or enemy icon: move, optionally roll weather, resolve icon event, resolve survival/camp.
  - Tile with village icon: move, resolve village event/services, resolve survival/camp.
  - Old tile without icon: move, optionally roll weather, roll clarity.
  - On an old tile without icon, an odd clarity roll must trigger an encounter event; an even clarity roll ends with camp.
- The system must support rolling the day's dice separately or as a bundled roll of 4D6: one terrain die, one clarity die, and two event dice.
- The system must end each ordinary day with camping/stat adjustment unless a source event explicitly skips or modifies it.

### Terrain Roll

- On a blank new tile, the system must roll 1D6 for terrain:
  - 1: Small Injury.
  - 2: Forest.
  - 3: Mountains.
  - 4: Grasslands.
  - 5: Desert.
  - 6: Swamp.
- The system must store the terrain result on the tile.

### Event Roll

- After terrain is known, the system must roll 2D6 to determine the event category for that terrain.
- Ruins and Encounters must require an additional 1D6 clarity roll.
- Ruins and Encounters must not repeat on the same tile.
- Open issue: the text extraction around repeated Ruins/Encounters is unclear. The source appears to describe replacement choices based on "Nothing", "1 above", or "1 below" and odd/even clarity, but this table should be visually verified.

### Small Injury

- A terrain roll of 1 must trigger Small Injury.
- Small Injury must deal -2 HP.
- The player remains on the same tile and camps if able.
- The system must track minor injury count.
- On the night of the third minor injury, the system must trigger the nightmare result:
  - Set HP to 10.
  - Set EP to 10.
  - Remove half of Bitliths.
  - Remove duplicate non-food items.

## Survival Rules

### Camping

- After surviving the day's event, the player must camp for the night unless an event says otherwise.
- Camping must require eating at least one food item and then sleeping.
- Eating and sleeping cannot be voluntarily skipped in ordinary play.
- Missing eating must increment starvation.
- Missing sleep must increment sleep deprivation.
- The player must eat at least 1 food item and may eat up to 3 food items per day.
- Food and sleep healing must not raise HP or EP above 20.

### Food Effects

- Meal Bar must restore +2 HP and +1 EP.
- Fruit must restore +1 HP and +2 EP.
- Tavern Meal must restore +10 HP and +4 EP.
- Old Wine Bottle must restore +4 HP and +4 EP.
- Old Wine Bottle must count as food.
- If the player has no other food while camping, Old Wine Bottle must be consumed as required food.

### Sleep Effects

- Sleeping outside must restore +3 HP and +2 EP.
- Sleeping at a village tavern must restore +5 HP and +4 EP.
- Improved Camping Gear must improve camping sleep to +4 HP and +4 EP.
- Village tavern sleep must be available for free via the tavern.

### Starvation

- The system must apply starvation penalties by consecutive missed eating days:
  - Day 1: -2 HP.
  - Day 2: -4 HP.
  - Day 3: -6 HP.
  - Day 4: -8 HP.
  - Day 5: -10 HP.
  - Day 6: -12 HP.
  - Day 7: -14 HP.
  - Day 8: death.
- Starvation must reset to 0 when a rule says it resets, including some obelisk events.

### Sleep Deprivation

- The system must apply sleep deprivation penalties by consecutive missed sleep days:
  - Day 1: -2 EP.
  - Day 2: -4 EP.
  - Day 3: -8 EP.
  - Day 4: -16 EP.
  - Day 5: death.
- Sleep deprivation must reset to 0 when a rule says it resets, including some obelisk events.

## Combat Rules

### Combat Flow

- Combat must be turn-based.
- Enemies must act first unless a specific event says the player makes the first move.
- Enemy attacks must be determined by rolling 1D6 and using the enemy card's 1-2, 3-4, or 5-6 attack value.
- Damage must be computed as ATK minus DEF.
- The system must apply damage to HP for player damage and enemy HP for enemy damage.
- Open issue: the source gives "ATK - DEF = Damage" but does not explicitly state whether negative damage floors at 0. This should be confirmed before implementation.

### Player Combat Actions

- On the player's turn, the system must support exactly one chosen action:
  - Basic Attack.
  - Tech Skill.
  - Escape.

### Basic Attack

- Basic Attack must use any available weapon the player can use.
- Basic Attack must always hit.
- Basic Attack must apply combat math.
- Fists must be available as base ATK 1.
- Ranged weapons must require arrows to deal damage.

### Tech Skills

- Tech Skills must be learned/unlocked before use.
- Tech Skills must require the right weapon or target type where specified.
- Tech Skills must cost EP where specified by the item catalog.
- During combat, the player must roll 1D6 for each Tech Skill they know, up to 3 dice.
- If at least one roll is equal to or less than the current level of that Tech Skill, the attack hits and that skill levels up.
- If no roll succeeds, the Tech Skill misses and the player's turn ends.
- The system must support Tech Skill training outside lethal combat through village fight clubs.
- Open issue: the exact initial training levels and "available dice" layout on the character sheet should be visually verified.

### Escape

- Escape attempt must cost -2 EP.
- Escape attempt must roll 1D6.
- Escape succeeds if the roll is higher than the enemy ESC value.
- On escape success, the player must move to a different tile.
- On escape success, the enemy remains on the original tile and does not heal.
- Escape outcomes must apply parity effects:
  - Success and even roll: skip eating and sleeping this day.
  - Success and odd roll: skip eating this day.
  - Failure and even roll: enemy gains +1 ATK for 1 turn.
  - Failure and odd roll: player cannot escape on the next turn.
- If the Radio Tower is shut down, enemies escaped from no longer wait for the player's return.

### Status Effects

- Burn must deal X damage at the beginning of the enemy's turn.
- Burn must stack up to 3 Burn.
- Stun must roll X D6 at the beginning of the enemy's turn.
- If any Stun die rolls 4, the enemy skips that turn.
- Stun must stack up to 3 Stun.
- Burn and Stun effects last for the whole fight.

## Enemy And Reward Rules

### Enemy Cards

- Each enemy card must define:
  - Attack values for 1-2, 3-4, and 5-6.
  - HP.
  - DEF.
  - ESC.
  - Special reward.
  - Reward dice/skill-dot count.
- The same enemy name may have different stats or rewards in different events; enemy stats should be event-specific data, not assumed global by name.

### Reward Roll

- After surviving combat, the player must roll for rewards according to the defeated enemy card.
- The player rolls 1D6 for every black skill-level dot on the enemy card.
- The player may choose any combination of rolled dice to determine a reward total.
- If a reward gives a Stash Reward, the player selects one item from the pool of numbers rolled.
- Special Reward must be offered when the selected reward total is 11-12.
- Open issue: black skill-dot counts were not reliably extractable from PDF text and should be visually verified for every enemy card.

### Reward Pool

- Reward totals must map as follows:
  - 1-2: Nothing.
  - 3-4: 3 Fruits.
  - 5-6: 3 Meal Bars.
  - 7-8: 3 Bitliths.
  - 9-10: 6 Bitliths.
  - 11-12: Special Reward.
  - 13-14: General Stash.
  - 15-16: Limited Stash.
  - 17-18: Laser Sword.

### General Stash

- General Stash must include:
  - 1: Strong Bow.
  - 2: Military Helmet.
  - 3: Climbing Gloves.
  - 4: Small Bow.
  - 5: 10 Arrows.
  - 6: Hunting Knife.

### Limited Stash

- Limited Stash must include:
  - 1-2: Nothing.
  - 3: Treasure Map 3.
  - 4: Treasure Map 4.
  - 5: Treasure Map 5.
  - 6: Hacked Minor Shield.

## Terrain Event Requirements

### Forest Event Table

- Event total 2 must resolve as Nothing or Cave of Shinda.
- Event totals 3-5 must create/resolve a Village.
- Event totals 6-8 must resolve Forest Ruins by clarity roll.
- Event totals 9-11 must resolve Forest Encounters by clarity roll.
- Event total 12 must mark the tile impassable, backtrack to camp, and start the day over.
- Forest Nothing must grant 3 Fruit.
- Open issue: the "Nothing or Cave of Shinda" condition should be visually verified; likely the special event is used once and Nothing is used afterward.

#### Forest Ruins

- R1 Tower of Sleepers must grant Sleeper's Leather Jacket and 2 Bitliths.
- R2 Abandoned Factory must grant 2 Spare Parts.
- R3 Old Gas Station must grant 2 Bitliths.
- R4 Brutalist Church must offer taking 4 Bitliths and route to story choice.
- R5 Rusty Mart must grant 1 Meal Bar.
- R6 Remains of a God must grant 3 Spare Parts.

#### Forest Encounters

- E1 Path Most Traveled must start Buster T-7 combat.
- E2 I'm Walking Here must start Buster T-5 combat.
- E3 Disciples of Alora must ask whether the player believes in Alora and route to story choice.
- E4 Caught in the Act must ask whether the player attacks the Helper F-2 and route to story choice.
- E5 God Hunter clue must record Radio Tower passcode clue: R1,C1 = 3; R2,C4 = 5; R2,C6 = 3.
- E6 King of the Jungle must start Mountain Lion combat.

### Mountains Event Table

- Event totals 2-3 must resolve as Impassable or Impasse Garden.
- Event totals 4-5 must create/resolve a Village.
- Event totals 6-8 must resolve Mountain Ruins by clarity roll.
- Event totals 9-12 must resolve Mountain Encounters by clarity roll.
- Impassable mountain results must mark the tile impassable, backtrack to camp, and start the day over.
- Open issue: the "Impassable or Impasse Garden" condition should be visually verified; likely the special event is used once and Impassable is used afterward.

#### Mountain Ruins

- R1 Old Farm Building must grant 4 Fruit.
- R2 Ski Resort must grant 3 Meal Bars and Climbing Gloves.
- R2 Ski Resort must allow an optional ski-lift ride about 2 tiles southeast.
- R3 Coal Mine must grant 2 Bitliths.
- R4 Alora Obelisk must fully restore HP and EP to 20 once; repeat visits do nothing.
- R5 Brutal Cult must offer taking 10 Bitliths and route to story choice.
- R6 Family of Goats must mark the tile impassable, grant 2 Fruit, camp, and start the next day on the previous tile.

#### Mountain Encounters

- E1 Rocky Mountain Nightmare must start Buster T-7 combat.
- E2 The Phoenix must start Buster T-5 combat.
- E3 Thank You For Your Donation must remove up to 5 Bitliths, deal -3 HP, camp, and require the player to go east next turn.
- E3 repeat visit must grant 4 Fruit and 10 Bitliths.
- E4 Runners High must grant 2 Fruit and 5 Arrows.
- E5 God Hunter clue must record Radio Tower location clue: about 3 tiles northwest.
- E6 Nature Hunts You must start Grolar Bear combat.

### Grasslands Event Table

- Event totals 2-3 must resolve as Nothing or Cave of Shinda.
- Event totals 4-5 must create/resolve a Village.
- Event totals 6-8 must resolve Grassland Ruins by clarity roll.
- Event totals 9-12 must resolve Grassland Encounters by clarity roll.
- Grasslands Nothing must pass peacefully with no major event.

#### Grassland Ruins

- R1 Apartment Building must grant 2 Meal Bars and 5 Bitliths, then add 1 day of sleep deprivation.
- R2 Nuclear Bunker must grant Survival Book and 5 Meal Bars.
- R3 Old High School must grant Hacked Minor Shield.
- R4 Burnt Church must grant Golden Cross and offers optional 4 Bitliths.
- R5 Rusty Train Cart must grant Meal Bar and Improved Camping Gear.
- R6 Wild Mushroom Trip must cause the next blank new tile to trigger the next cutscene event and set time to that calendar day.
- Open issue: Grassland R4's optional 4 Bitliths choice has no clearly extracted branch in the story-choice pages.

#### Grassland Encounters

- E1 Whites of Their Eyes must roll 1D6 and route even/odd to story choice.
- E2 You Are The Stick must start Seeker K-9 combat.
- E3 Park of Prayer must ask whether the player believes Alora is with them and route to story choice.
- E4 Armory must grant 2 Bitliths, 1 Meal Bar, and Survival Book, then start Seeker K-9 combat.
- E4 Armory must reveal the clue that the Power Supply can be hit with an EMP.
- E5 Electrician must reveal a Power Supply location clue and leave 1 Meal Bar and 2 Bitliths.
- E6 Dinner Bell must start Wild Dogs combat.
- Open issue: E5 says the Power Supply is about 1 tile northeast in the Forest, while the Day 50 cutscene says the Power Supply tile is Desert. This conflict should be resolved during data entry.

### Desert Event Table

- Event totals 2-4 must resolve as Impassable or Impasse Garden.
- Event totals 5-8 must resolve Desert Ruins by clarity roll.
- Event totals 9-12 must resolve Desert Encounters by clarity roll.
- Desert has no village event in the terrain table.
- Desert has no adverse weather when challenge weather is enabled.

#### Desert Ruins

- R1 Distillery must grant 3 Fruit and 5 Bitliths, then camp.
- R2 Tankman must grant Military Helmet.
- R3 Alora Obelisk must set HP and EP to 20 and reset starvation and sleep deprivation to 0.
- R4 Good Fortune must grant 2 Fruit and Set of Alora Cards, then camp.
- R5 Theater must grant 2 Bitliths, then sleep near the arcade machines.
- R6 Federal Building must grant Small Bow, 5 Arrows, and 3 Bitliths.

#### Desert Encounters

- E1 Work On Your Cardio must start Buster T-5 combat.
- E2 Keep the Seeker K-9 Quiet must grant 4 Bitliths, then start Seeker K-9 combat.
- E3 Rest Is For The Wicked must start Mountain Lion combat.
- E4 Hills Have Looks must deal -2 HP, grant Hunting Knife, and offer taking 20 Bitliths with story-choice routing.
- E5 Oasis must start Seeker K-9 combat, then grant Journal I and record clue: R4,C2 = 1; R4,C3 = 3; R3,C6 = 1.
- E6 Tradesman must grant 10 Bitliths, resolve a Seeker K-9 reward roll without ordinary combat, and record village clue: about 1 tile east.

### Swamp Event Table

- Event totals 2-4 must mark the tile impassable, backtrack to camp, and start the day over.
- Event totals 5-8 must resolve Swamp Ruins by clarity roll.
- Event totals 9-12 must resolve Swamp Encounters by clarity roll.
- Swamp has no village event in the terrain table.

#### Swamp Ruins

- R1 Eternal Flame must camp; the flame is gone next morning.
- R2 Longest Bridge must camp.
- R3 Obelisk in Darkness must set HP and EP to 20, reset starvation and sleep deprivation to 0, and do nothing on repeat visits.
- R4 Swamp Church must offer taking 3 Bitliths and route to story choice.
- R5 Underwater Graveyard has no mechanical reward in extracted text.
- R6 Y2K2 must grant 4 Bitliths and Sleeper's Leather Jacket.

#### Swamp Encounters

- E1 Waiting For Service must start Buster T-7 combat.
- E2 Lady In The Mist must ask whether to give a food item and route to story choice.
- E3 Arsonist must start Buster T-5 combat, then grant Journal II, Small Bow, and 6 Arrows, and record clue: R6,C1 = 4; R5,C3 = 5; R6,C6 = 5.
- E4 Last Elder has no mechanical reward in extracted text.
- E5 Dog Eat Dog must ask whether to avenge the kid and route to story choice.
- E6 You're Too Late must start Alligator combat with the player making the first move.

## Story Choice Requirements

- The system must support story choices that branch by explicit Yes/No decisions.
- The system must support story choices that branch by even/odd die results.
- Story choices may apply immediate combat, currency changes, item grants, forced movement, camp changes, or tile marking.

### Extracted Branch Effects

- Forest R4 Yes: take 4 Bitliths and fight Buster T-3.
- Forest R4 No: leave coins and camp safely.
- Forest E4 Yes: fight Buster T-7.
- Forest E4 No: no fight; leave safely.
- Forest E3 Yes: lose half Bitliths rounded up and mark tile impassable.
- Forest E3 No: add 1 day starvation and 1 day sleep deprivation, move about 2 tiles northeast, set Bitliths to 0.
- Mountain R5 Yes: take 10 Bitliths.
- Mountain R5 No: take no Bitliths and camp.
- Grassland E3 Yes: fight Buster T-5; after fight, receive 5 Bitliths from the bowl.
- Grassland E3 No: fight Buster T-7; after fight, receive 10 Bitliths from the bowl.
- Swamp R4 Yes: return the 3 Bitliths and lose half remaining Bitliths rounded up.
- Swamp R4 No: leave safely.
- Desert E4 Yes: take 20 Bitliths and escape safely.
- Desert E4 No: fight Buster T-7, then take 20 Bitliths afterward.
- Swamp E2 Yes: spend 1 Food Item; no combat.
- Swamp E2 No: fight Buster T-5, then find 3 Fruit and leave 1 Fruit on the enemy corpse.
- Swamp E5 Yes: gain 4 Bitliths, Small Bow, 3 Arrows, and Journal II; spend -2 EP and 2 Arrows; add 1 day starvation and 1 day sleep deprivation.
- Swamp E5 No: gain Light Shoes.
- Open issue: the story-choice pages are multi-column and text extraction interleaves columns. The branch mapping above should be visually checked before production data entry, especially Grassland E1 Even/Odd.

## Calendar And Story Event Requirements

### Calendar

- The system must track days 1-56 on the character sheet/calendar.
- Bold days must indicate major story events.
- Certain events may advance time directly to the next cutscene day.

### Day 03

- Day 03 must force the new tile to be Forest.
- Day 03 must grant Sleeper's Leather Jacket and Solar Powered Taser.
- Day 03 must conclude the day and then require eating, sleeping, and stat adjustment.

### Day 15

- Day 15 must trigger on the next new tile, which must be Forest.
- Day 15 must start a Buster T-7 fight after the cutscene.
- Day 15 must conclude the day and then require eating, sleeping, and stat adjustment.

### Day 25

- Day 25 must keep the player on the same tile.
- Day 25 must skip eating and sleeping that night.
- Day 25 must add 1 day starvation and 1 day sleep deprivation.
- After Day 25, the system must track The God's location on the map.
- At the beginning of each day after Day 25, the system must roll 1D6 and move The God according to the priority map.
- The player may run into and fight The God at any time after The God is being tracked.

### Day 40 Radio Tower

- If the Radio Tower was already placed on the map, visiting that tile must trigger the Radio Tower event.
- If the Radio Tower was not placed, the next new tile must trigger the Radio Tower event and that tile must be Mountain.
- The Radio Tower event must present a 6x6 number puzzle using numbers 1-6.
- The puzzle rule must require every row, column, and 6-cell box to contain 1-6 without repeats.
- The player must have 100 seconds to solve the puzzle before needing to leave.
- Leaving must require a whole night to recover before trying again.
- Solving the puzzle and turning off the Radio Tower must:
  - Reduce The God's HP by 10.
  - Reduce robot enemies' HP by 2.
  - Cause enemies escaped from to no longer wait for the player's return.

### Day 50 Power Supply

- If the Power Supply was already placed on the map, visiting that tile must trigger the Power Supply event.
- If the Power Supply was not placed, the next new tile must trigger the Power Supply event and that tile must be Desert.
- If the player can use TS-4 EMP Grenade, the player may spend -2 EP up to 3 times to attempt to shut down the Power Supply.
- Shutting down the Power Supply must:
  - Reduce The God's HP by 20.
  - Reduce robot enemies' HP by 2.
- If an enemy is fought on the Power Supply tile while it still works:
  - Solar Powered Taser must be restored after 1 full turn in combat.
  - Robot enemies must heal +1 HP at the beginning of their turn.
- Open issue: the exact Power Supply attempt resolution/puzzle is not fully extractable from text and should be visually checked.

### After Day 50

- After Day 50, there are no more days to count.
- The player may confront The God whenever ready.

### Ending

- Defeating The God must trigger the ending sequence.
- The God must have no reward and must route to the ending rather than ordinary reward logic.

## Villages, Shops, Quests

### Villages

- New villages must be marked on the map and numbered in discovery order.
- Villages must offer tavern services.
- Villages must offer shops with unlimited quantities of listed items.
- Villages must be able to buy items from the player using item sell prices.
- Tavern Meal must cost 3 Bitliths.
- Tavern sleep must restore +5 HP and +4 EP.

### Shop Progression

- Village 1 shop must include Fruit, Meal Bar, Hunting Knife, Small Bow, 10 Arrows, and TS-1 Dodge & Strike.
- Village 2 shop must add TS-2 Roll & Wire Slice, Treasure Maps 1-6, Strong Bow, and Laser Sword crafting/purchase options.
- Village 3 shop must add TS-3 Jump & Attack and include items from Villages 1 and 2.
- Treasure Map prices must be:
  - Map 1: 5 Bitliths.
  - Map 2: 10 Bitliths.
  - Map 3: 15 Bitliths.
  - Map 4: 20 Bitliths.
  - Map 5: 25 Bitliths.
  - Map 6: 30 Bitliths.
- Open issue: buy/sell prices in the shop table should be visually verified against the item catalog before production data entry.

### Fight Club

- Every village must support access to a fight club.
- Fight club entry must cost 5 Bitliths.
- Fight clubs must allow training any skill using the same success logic as combat.
- After each training attempt, the sparring partner may hit the player.
- Sparring damage must be determined by rolling 1D6 as X.
- If X is even, no sparring damage occurs.
- If X is odd, the player takes -X HP.
- After 4 successful trainings at a fight club, the player must leave.
- After being kicked out, the player cannot train at that same club for 7 calendar days.

### Quest Discovery

- Each new village must offer one quest in order.
- Quests must be found in order, one village at a time.
- Quest targets must be placed relative to the village/focus tile and must use terrain requirements.

### Quests

- Quest 1 must place a Mountain target 1 tile northeast. Completing it grants Jewelry Box and starts Grolar Bear combat. Returning Jewelry Box to Village 1 grants 30 Bitliths.
- Quest 2 must place a Forest target 1 tile east. Completing it grants Engineered Plant. Returning to Village 2 grants 5 Bitliths and lets the player keep Engineered Plant.
- Quest 3 must place a Mountain target 1 tile southwest. Completing it grants 2 Meal Bars and Light Shoes, marks the tile impassable, and returning to Village 3 grants 5 Bitliths.
- Quest 4 must place a Desert target 1 tile northwest. Completing it grants 3 Old Wine Bottles. Returning all 3 to Village 4 grants 50 Bitliths; returning 2 or fewer grants 10 Bitliths per bottle.

### Treasure Maps

- The system must support purchased treasure maps that place treasure icons at relative locations.
- Map 1 must place a Grasslands treasure 2 tiles northeast and grant Improved Camping Gear.
- Map 2 must place a Desert treasure 1 tile east and grant Set of Alora Cards.
- Map 3 must place a Grasslands treasure 1 tile northeast and grant Survival Book.
- Map 4 must place a Desert treasure 2 tiles northwest and grant Journal I.
- Map 5 must place a Swamp treasure 2 tiles southwest and grant Journal II.
- Map 6 must place a Mountains treasure 1 tile west and grant Hacked Minor Shield.

## Special Location Requirements

### Impasse Garden

- The system must support Impasse Garden as a non-repeatable special location.
- The location must have 10 turns.
- At the beginning of each turn, roll 1D6 and move up to that many spaces on the local map.
- The player may interact with a map event by moving onto its tile.
- The turn ends after interacting with a map event or after running out of moves.
- The day ends after the 10th turn or after completing map event E8.
- E1 must ask whether to help a trapped Helper F-2 and store that choice.
- E5 must start Buster T-3 combat.
- E8 must start Titan F-1 combat and grant God Finger after completion.
- If the player did not help the Helper F-2, escape must roll 2D6 as X, spend -X EP, spill excess cost into HP if EP is insufficient, add 1 day of missed eating and sleeping, and conclude the day.
- If the player helped the Helper F-2, the player escapes safely, camps like usual, and marks the tile impassable.

### Cave Of Shinda

- The system must support Cave of Shinda as a non-repeatable special location.
- The location must have 10 turns.
- At the beginning of each turn, roll 1D6 and move up to that many spaces on the local map.
- The player may interact with a map event by moving onto its tile.
- The turn ends after interacting with a map event or after running out of moves.
- The day ends after the 10th turn or after completing map event E8.
- E1 must grant 2 Spare Parts and Solar Powered Light.
- The E1 Solar Powered Light is low on charge and lasts only 4 turns in combat.
- E5 must grant 2 Bitliths.
- E6 must start Buster T-3 combat.
- E7 must grant Golden Cross.
- E8 must start Android combat and grant Cyclops Mask after completion.

## Item Requirements

### Duplicate Items

- The player may find duplicate items.
- Passive effects from duplicate items must not stack.
- Food is the exception; duplicate food quantities are consumable and must stack as inventory.

### Food

- Meal Bar: +2 HP, +1 EP.
- Fruit: +1 HP, +2 EP.
- Old Wine Bottle: +4 HP, +4 EP; counts as food.

### Tools

- Solar Powered Light: +1 ATK in dark and rain; normally dies after 8 turns in combat.
- Solar Powered Taser: +9 ATK and +1 Stun; works once per day unless restored by Power Supply rules.

### Weapons

- Hunting Knife: +4 ATK; melee.
- Laser Sword: +8 ATK; melee; made from Laser Arm and Spare Parts.
- God Finger: +7 ATK; melee.
- Arrows: +0 ATK alone; required for bows.
- Small Bow: +3 ATK; ranged.
- Strong Bow: +6 ATK; ranged.

### Wearables

- Climbing Gloves: +1 DEF.
- Military Helmet: +2 DEF.
- Sleeper's Leather Jacket: +1 DEF.
- Hacked Minor Shield: +3 DEF.
- Light Shoes: +1 DEF and allows TS-5.
- Cyclops Mask: +1 DEF from robots.

### Tech Skills

- TS-1 Dodge & Strike: costs 2 EP; +2 ATK; dart to the side and strike with any melee weapon.
- TS-2 Roll & Wire Slice: costs 3 EP; +4 ATK; slice the underside of a robot with any melee weapon.
- TS-3 Jump & Attack: costs 4 EP; +6 ATK; jump and attack any enemy with any weapon.
- TS-4 EMP Grenade: costs 2 EP; +3 Stun; toss Solar Powered Taser at a robot.
- TS-5 Sprint Tech: costs 2 EP; lowers any enemy's ESC by 2.
- TS-6 Electric Bolts: costs 2 EP; electrifies arrows for the rest of combat; +2 ATK and +1 Stun.
- TS-7 Flaming Arrows: costs 2 EP; sets arrows on fire for the rest of combat; +3 ATK and +1 Burn.

### Maps, Scrap, And Treasures

- Treasure Maps 1-6: notes left by travelers that place treasure icons.
- Spare Parts: used to craft better weapons.
- Laser Arm: used to make Laser Sword; provides +1 ATK to robots as an item effect in the catalog.
- Set of Alora Cards: treasure item.
- Improved Camping Gear: improves sleep while camping to +4 HP and +4 EP.
- Journal I: unlocks TS-6.
- Journal II: unlocks TS-7.
- Survival Book: unlocks TS-4.
- Engineered Plant: grants +1 Fruit per 5 days.
- Jewelry Box: quest/treasure item.
- Golden Cross: treasure item.

## Death Requirements

- If HP ever reaches 0, the player dies.
- On death, the system must ask whether the player wishes to continue.
- If the player declines, the game ends.
- If the player continues:
  - Set HP to 10.
  - Set EP to 10.
  - Remove half the player's Bitliths, rounded down.
  - Remove duplicate non-food items.
  - Return to the morning of the same day.
  - Reset the attempted event as if it did not happen.
  - Enemies faced that day must have half HP, rounded down.

## Challenge Mode Requirements

### Weather

- Weather must be optional.
- If enabled, weather must be rolled after terrain is known.
- Weather must not apply in Desert terrain.
- Weather roll table:
  - 1-2: Heavy Rain, -1 DEF, prevents gaining EP while sleeping.
  - 3: Harsh Snow, -2 DEF, prevents gaining HP while sleeping.
  - 4: Extreme Winds, -1 ATK, prevents sleeping at night and adds 1 day sleep deprivation.
  - 5-6: Dense Fog, -2 ATK, prevents escaping fights.

### Terrain Odds Variant

- Instead of 1D6 terrain, the system may support rolling 3D6.
- The majority result determines terrain.
- If there is no majority, reroll until a majority exists.
- When discovering a blank new tile, lock 1D6 for every 2 matching terrains touching the new tile.
- Locked dice should improve the odds of similar terrains touching each other.

### Rusty Weapons Variant

- If enabled, every melee weapon found must have -1 ATK.

## Asset-Derived Requirements

- The system should support digital markers for:
  - Circle markers in blue, green, orange, purple, red, and yellow.
  - Square markers in blue, green, orange, purple, red, and yellow.
  - TS tokens in black, blue, green, orange, purple, red, and yellow.
- The system should support map tile assets for Miru 1 and Miru 2 terrain categories: desert, forest, grassland, mountain, swamp.
- The system should support icons for village, enemy, treasure, and impassable.
- The system should support HP, EP, starvation, sleep deprivation, and poison trackers as visual assets.
- Open issue: `tracker_poison.png` exists, but the v2e rule text extracted from the PDFs does not define a poison mechanic.

## Verification And Data Entry Notes

- The searchable v2e PDFs cover the core rules; the low-ink booklet is image-only and appears to be an alternate export.
- Some table-heavy pages extract poorly. Before implementation, visually verify:
  - All enemy card stat blocks and reward-dot counts.
  - Story choice branch mapping on pages 40-43.
  - Shop buy/sell prices.
  - Power Supply shutdown resolution.
  - Repeated Ruins/Encounters replacement table.
  - Tech Skill initial levels and "available dice" behavior from the character sheet.
- The future digital rules data should preserve event-specific enemy variants rather than collapsing enemies by shared name.
