# Product Vision - Miru Digital

## 1. Vision & Mission

### Vision Statement
Solo RPGs become approachable daily rituals for digital-native players who want imagination, structure, and mystery without needing to fight the rulebook first.

### Mission Statement
Miru Digital turns the Miru solo pen-and-paper RPG into a mobile-first guided play table that handles rules, state, dice, saves, and return context while preserving the player's imagination.

### Founder's Why
Gerg has spent years around serious enterprise software, first as a full-stack developer and now as a customer-facing executive at a product company. That matters because Miru Digital is not a content problem first; it is a workflow problem disguised as a game. The source game has rules, tables, state, edge cases, and progression. The challenge is to make those systems feel like play instead of administration.

This project is also a deliberate creative counterweight to enterprise tooling. Gerg's phrase for the danger is useful: Miru Digital should not become "enterprise software wearing a game skin." The product should use the craft of enterprise workflow design, but point that craft toward a focused, tactile, low-friction solo adventure.

The founder-market fit is strongest where software judgment meets restraint. A less experienced builder might either over-automate Miru into a generic mobile RPG or under-build it into a PDF helper. Gerg is positioned to build the harder middle: a purpose-built play companion that understands the rules deeply but keeps the player's interpretation in the foreground.

### Core Values
**Protect the ritual.** Every product decision should make it easier to open the app, take one meaningful day in the wasteland, write a short journal entry, and return later. Features that add spectacle but interrupt this rhythm should be cut.

**Guide only what needs guidance.** The app should explain the next legal step, surface relevant rules, and handle bookkeeping. It should not narrate over the player's imagination or convert every moment into heavy UI.

**Respect the source before expanding it.** The first serious version must be faithful to Miru 1 v2e as documented in `docs/miru-rules-requirements.md` and visually verified against source material where extraction is ambiguous. New conveniences are welcome only when they do not distort rules, pacing, or tone.

**Start fast, resume cleanly.** A new player should reach the first meaningful Next Day flow quickly, and a returning player should immediately know where they are, what happened yesterday, what state matters, and what to do next.

**Polish through clarity, not flash.** Miru Digital should feel finished because it is readable, calm, responsive, and trustworthy. It should never lean on loot dopamine, gacha patterns, or overproduced combat animation to feel valuable.

### Strategic Pillars
**The guided play table is the product.** The core screen must carry the experience: map, character state, current prompt, dice, choices, and journal context. Secondary screens exist to support that table, not compete with it.

**Rules accuracy is a feature.** For this product, a wrong rule is not a small bug. It breaks trust with both Miru fans and new players. Source verification, test fixtures, and content QA belong in the main roadmap.

**Mobile-first means one-handed clarity.** The first target is mobile web. Layout, touch targets, prompt length, map interactions, and save feedback must work on a phone before they are expanded for desktop.

**Rights shape the launch path.** Until digital adaptation rights are clear, public launch strategy should stay conservative. The product can be built as a private prototype and rights-first pitch asset before becoming public.

### Success Looks Like
In 12 months, Miru Digital is the most natural way for curious digital-native players to try Miru: a polished mobile web app with full standard Miru 1 v2e rules coverage, reliable cloud saves, a strong first-run experience, and a small but active group of players completing runs. Rights have either been secured for a public Miru adaptation or the project has been intentionally repositioned. The product has at least 100 private or public testers, a completion funnel showing that most activated users reach their first camp, and a reputation among solo RPG players as faithful, quiet, and surprisingly easy to return to.

## 2. User Research

### Primary Persona
Sam is a 25-38 year-old indie game explorer who plays atmospheric games, roguelites, narrative indies, and the occasional tabletop-adjacent game. Sam is tech-comfortable and willing to try unusual systems, but expects software to teach through interaction rather than front-load a manual. On a typical evening, Sam has 20-40 minutes of attention and wants something stranger and more personal than a conventional mobile game.

Sam currently discovers solo RPGs through itch.io, Reddit, Discord, YouTube essays, indie game newsletters, and word of mouth. The pattern is familiar: Sam downloads or buys a compelling PDF, skims the rules, feels intrigued, then stalls when the game asks for map setup, character sheet tracking, dice tables, and interpretation all at once. Sam would switch to Miru Digital if it made the first session feel like entering the game instead of preparing paperwork.

The emotional state is not hostility toward analog games. It is curiosity mixed with mild embarrassment: "This looks cool, but I do not know if I am doing it right." Miru Digital wins when Sam feels competent in the first session without feeling patronized.

### Secondary Personas
Existing solo RPG hobbyists are the credibility layer. They already understand journaling games, oracle tables, and emergent solo play, and they will notice quickly if Miru Digital distorts the source rules. They care about fidelity, exportability, and whether the app respects the analog feel.

Existing Miru players are the sharpest validation group if they can be reached. They know the game's pacing, oddities, and table flow. They may not need onboarding, but they will value save state, combat math, map tracking, and faster lookup if the implementation is faithful.

Indie game reviewers and curators are not the primary users, but they can help the product find the right audience after rights are clear. They need a fast way to understand the loop and a clean story about why this is not just another mobile RPG.

### Jobs To Be Done
Functionally, Sam wants to start a solo RPG run without printing sheets, cross-referencing a PDF, building a tracker, or wondering which roll happens next. The app must let Sam create or resume a run, move through the daily turn structure, resolve events and survival, track the map, and keep a short journal.

Emotionally, Sam wants to feel like the game is welcoming them into a strange world rather than testing whether they are a "real" tabletop player. The product should make competence feel quiet and immediate.

Socially, Sam wants to be able to describe the run as a personal adventure, not as time spent learning a complicated PDF. Screenshots, journal excerpts, and map state can eventually support that, but they should not push sharing before the player has a story worth sharing.

### Pain Points
**1. First-session overload.** This happens at the exact moment curiosity is highest and commitment is lowest. The player faces rules, sheet setup, map setup, dice logic, survival rules, event tables, and interpretation before the game has produced enough emotional reward. Today, the workaround is skimming, guessing, or abandoning the game. Consequence severity is high because it stops activation entirely.

**2. Fragmented play surfaces.** Players who push through setup often use a PDF, physical or digital dice, a notes app, a map image, a character sheet, and maybe a spreadsheet. The friction repeats every session. The workaround is tolerated by hobbyists, but it is a poor fit for mobile-first play and for newcomers. Severity is high for the target audience.

**3. Weak return context.** Solo RPGs are often played in short sessions, but analog state can be hard to reconstruct after a break. The player may forget what happened yesterday, which enemy remains, what rule applies, or why a map mark mattered. Consequence severity is medium to high because it damages retention even after activation.

**4. Uncertainty about correctness.** New players often worry that they are playing wrong. Some ambiguity is part of solo RPG interpretation, but rule uncertainty is different. Miru Digital should distinguish between imaginative choice and mechanical procedure. Severity is medium, but it heavily affects confidence.

### Current Alternatives & Competitive Landscape
The direct alternative is the Miru PDF plus printed or digital sheets. It is faithful, portable, and complete, but it asks the player to be the rules engine, state manager, and narrator at the same time. Switching to Miru Digital requires trust that the app is faithful and that it will not take away the analog charm.

Generic dice rollers and notes apps solve fragments of the problem. They are flexible and familiar, but they do not know Miru's turn structure, event repeatability, combat math, inventory categories, map rules, or survival penalties. They reduce friction only for players who already understand what to roll and why.

Virtual tabletops such as Roll20 or Owlbear Rodeo can hold maps and tokens, but they are built for broad tabletop flexibility. That breadth is the wrong shape for one-player Miru. Miru Digital differentiates by being narrower, calmer, and purpose-built.

"Do nothing" is the largest competitor. Many users simply abandon the PDF and move on to a digital game that teaches itself through play. The product must beat that invisible alternative by reducing time-to-first-meaningful-play.

### Key Assumptions to Validate
We assume digitally native RPG players want a guided version of a pen-and-paper solo RPG because first-session friction is the blocker. To validate, recruit 10-20 target users and measure whether they reach the first camp and choose to continue.

We assume the app can automate procedures without making the game feel less imaginative. To validate, ask testers after the first session whether the app felt like a guide, a game, or an admin tool, and watch for moments where automation feels too controlling.

We assume a mobile-first web app is the right first surface. To validate, test on real phones early and measure session completion without desktop fallback.

We assume source requirements are complete enough to drive implementation. To validate, build rule fixtures from `docs/miru-rules-requirements.md` and mark every open issue that needs PDF visual verification before it becomes executable logic.

We assume Supabase Anonymous Auth will preserve low-friction start while enabling cloud saves. To validate, test first-run auth invisibility, browser refresh, sign-out edge cases, and optional email upgrade.

We assume rights can be clarified or secured before public launch. To validate, contact the creator or publisher with a concise pitch, prototype, and proposed usage boundaries before public distribution.

We assume "rules-complete polished game in 90 days" is possible with AI-assisted development. To validate, timebox the first engine slice and compare actual implementation velocity against the roadmap after Phase 1.

### User Journey Map
Sam first hears about Miru Digital through a short post, demo clip, or recommendation that frames it as a guided way to play a solo RPG on a phone. Curiosity is high, but skepticism is also present: Sam has bounced off PDFs before.

During consideration, Sam wants evidence that this is not a flashy mobile RPG reskin. The best proof is a short clip of the play table: tap Next Day, see a roll, get the relevant rule prompt, make a choice, camp, and write one sentence. The friction point is rights and trust; public messaging should be careful until permission is clear.

On first use, Sam should enter a run without account friction. The app creates an anonymous session, initializes HP, EP, food, day, map row, and the first playable state. The desired emotion is "I get it" within the first minute.

The magic moment happens when Sam taps Next Day and the app resolves the procedural complexity into a readable sequence. It should feel like the game suddenly has momentum. If Sam has to read a long tutorial first, the product has missed.

Habit formation comes from return context. Sam opens the app after a break and sees the current tile, day, HP, EP, inventory, last journal note, unresolved enemy or icon state, and the next valid action. Advocacy comes later, when Sam can show a run map or journal excerpt and say, "This finally made solo RPGs click for me."

## 3. Product Strategy

### Product Principles
**Make the next action obvious.** The player should rarely ask, "What do I do now?" The guided flow must always surface the current phase, available actions, and why an action is unavailable.

**Keep the player as author.** Automate arithmetic, state, rolls, and rule routing. Leave interpretation, choice, and journaling to the player.

**Treat source ambiguity as a product state.** If the source extraction has an open issue, the app should not silently invent a rule. Development should mark ambiguity in test fixtures and verify against the source before implementation.

**Design for interruption.** A session may last five minutes. Every screen should support clean exit, autosave, and return context.

**One game, one player, one table.** Resist generalized tabletop tooling. The product wins by being deeply specific to Miru.

### Market Differentiation
Miru Digital is not competing by offering every tabletop feature. It competes by refusing that breadth. Generic VTTs, dice rollers, and note systems require the player to assemble a play environment and remember the procedure. Miru Digital already knows the world shape, turn routing, survival sequence, combat flow, reward rules, item categories, and journal cadence. That specificity matters because the target user is not looking for a sandbox tool; Sam is looking for permission to start playing. The defensibility is not technical complexity alone. It is the combination of rules fidelity, source-aware data modeling, mobile-first interaction, and restraint.

### Magic Moment Design
The magic moment is the first clean Next Day flow. For it to happen reliably, the app must know the run state, tile state, current day, terrain state, icon state, event repeatability, survival needs, inventory, HP, EP, and legal next actions. It must show only the relevant prompt for the current phase rather than dumping the rulebook into the UI.

The shortest path is: open app, start anonymous run, show play table, tap Next Day, resolve movement or current tile state, roll the needed dice, show the result with concise context, apply state changes, camp, and write a short journal entry. This must happen in the MVP. Full rules completeness can expand after the first vertical slice, but the guided flow itself cannot be deferred.

### MVP Definition
The MVP should be a private alpha that proves the core play loop and sets up a source-verified path to rules completeness. It should be buildable in 4-8 weeks by a solo founder using Codex if scope is held tightly.

In scope: anonymous run creation, Supabase-backed save state, a mobile-first play table, the 12x9 hex map model, character state, inventory basics, dice utilities, daily turn state machine, terrain roll handling, camp/survival handling, journal entry capture, and a representative event/combat slice sufficient to prove the Next Day magic moment. Done means a target user can start a run, complete several in-game days, survive or fail according to rules, save automatically, return later, and understand what happened.

Also in scope: a source-data structure for rule tables and content import, even if not every table is populated in the MVP. The product should not hard-code rules into components. Done means source-derived content can be added and tested without rewriting the UI.

The 90-day goal is stronger than the MVP: a rules-complete polished private alpha. That should include full standard Miru 1 v2e rule coverage, content QA, combat/reward completion, villages/shops/quests, story days, special locations, run history, and challenge mode only if the standard loop is already stable.

### Explicitly Out of Scope
Public launch is out of scope until rights and licensing are clarified. It is tempting because feedback is useful, but public distribution creates legal and trust risk. Reconsider only after creator or publisher outreach produces a clear path.

Monetization is out of scope. No payments, subscriptions, ads, or paid tiers belong in the early product. Reconsider only after rights are clear and real usage suggests a sustainable model.

Heavy animation, RPG combat spectacle, loot dopamine, gacha loops, and character progression beyond the source game are out of scope. They are tempting because they can make a mobile product feel more game-like, but they would weaken the analog solo RPG promise.

Multiplayer, campaign sharing, marketplace content, and generalized RPG tooling are out of scope. Reconsider only after the one-player Miru experience is excellent.

Native mobile apps are out of scope for the first build. A mobile-first web app gives faster iteration and lower install friction. Reconsider native packaging only after the web app proves retention.

### Feature Priority (MoSCoW)
**Must Have:** anonymous start, run creation, Supabase save/load, mobile play table, map state, character state, inventory, dice roller, daily turn state machine, terrain and camp flow, journal entries, autosave, source-content data architecture, and enough event/combat logic to deliver the first Next Day magic moment.

**Should Have:** full standard terrain event coverage, combat and reward completion, villages and shops, item catalog, rule lookup, event history, run history, source verification checklist, exportable journal, and improved onboarding.

**Could Have:** challenge mode variants, visual token placement refinements, shareable run summaries, email account upgrade, offline cache, PDF source cross-links for internal QA, and advanced accessibility preferences.

**Won't Have This Time:** payments, public marketplace, multiplayer, generalized VTT tools, heavy animation, AI-generated story narration, native app stores, and public launch before rights clarity.

### Core User Flows
**Start a run.** Trigger: Sam opens the app for the first time. Steps: create anonymous Supabase session, initialize run state, show a concise intro, place the starting tile in row 01, and land on the play table. Outcome: Sam can tap Next Day without account setup. Success criteria: first playable state in under 60 seconds on a mid-range phone.

**Resolve a day.** Trigger: Sam taps Next Day. Steps: inspect tile and day state, present legal movement or event flow, roll required dice, resolve terrain/event/combat/survival as applicable, apply state changes, autosave, and prompt for a short journal entry. Outcome: one complete in-game day is resolved with visible state changes. Success criteria: Sam understands why each step happened without opening a rulebook.

**Resume a run.** Trigger: Sam returns after a break. Steps: load the most recent run, show current day, tile, HP, EP, inventory highlights, last journal note, and the next valid action. Outcome: Sam continues without reconstructing context manually. Success criteria: fewer than 10 seconds from app open to knowing what to do.

### Success Metrics
The primary metric is activated first-run completion: the percentage of new users who start a run and complete the first full camp. Good is 50 percent in private alpha; great is 70 percent.

Secondary metrics include time to first Next Day completion, target under 90 seconds and great under 45 seconds; return rate within 7 days, target 25 percent and great 40 percent; rules-blocker rate, target fewer than 1 unresolved blocker per tester session; and save reliability, target 99 percent successful autosaves during testing.

Leading indicators include number of source requirements covered by tests, percentage of ambiguous rules visually verified, session length distribution, number of journal entries per active run, and qualitative tester language around whether the app felt like a guide or a video game.

### Risks
**Rights risk:** likelihood medium, impact high. Mitigation: keep early use private, contact rights holder early, document assumptions, and avoid public launch until permission is clear.

**Rules transcription risk:** likelihood high, impact high. Mitigation: build source verification into the data pipeline, keep open issues visible, and test rule fixtures against `docs/miru-rules-requirements.md`.

**Scope risk:** likelihood high, impact high. Mitigation: separate MVP magic moment from 90-day rules completeness and use roadmap phases with review gates.

**Tone risk:** likelihood medium, impact high. Mitigation: design with analog field kit constraints, avoid spectacle, and test whether players describe the product as guided rather than overproduced.

**Mobile complexity risk:** likelihood medium, impact medium. Mitigation: prototype on real phones from Phase 0 and avoid desktop-first layouts.

**Backend friction risk:** likelihood medium, impact medium. Mitigation: make Supabase Anonymous Auth invisible in first use and test session persistence early.

**Content QA fatigue:** likelihood high, impact medium. Mitigation: create structured data entry tasks, validation scripts, and progress tracking rather than relying on one heroic pass.

## 4. Brand Strategy

### Positioning Statement
For digitally native RPG players who are curious about solo pen-and-paper games but bounce off setup friction, Miru Digital is the guided mobile play table that makes Miru playable immediately. Unlike generic dice rollers, PDFs, and virtual tabletops, Miru Digital is purpose-built for one game and one player, so it knows what matters next.

### Brand Personality
Miru Digital is a patient game master. It is warm, clear, and encouraging, but it does not perform. If it were a person, it would bring a field notebook, a pencil, and a spare die, then quietly point to the rule that matters. It would never shout, shower the player with rewards, or pretend uncertainty is impossible.

In onboarding, it is calm and specific. In errors, it is plainspoken and useful. In success states, it gives the player enough closure to move forward, then gets out of the way.

### Voice & Tone Guide
| Context | Do | Don't |
| --- | --- | --- |
| Onboarding | "Start with a name and a place on the northern edge of the map." | "Welcome, hero! Your epic journey begins now!" |
| Error states | "You need a valid adjacent tile before moving." | "Oops! Something went wrong with your movement request." |
| Empty states | "No journal entry yet. Add a sentence before you end the day." | "Your journal is empty. Click here to create content." |
| Success messages | "Camp is set. Eat, rest, and mark the day." | "Quest progress updated successfully." |
| Marketing copy | "Play Miru from your phone without juggling the rulebook." | "The ultimate next-generation RPG experience." |

The constant voice is clear and companionable. Tone can become more instructive during onboarding and more atmospheric during event prompts, but it should never hide the rule, over-explain, or use generic productivity language.

### Messaging Framework
Tagline: "Miru, guided for solo play."

Homepage headline: "Explore Miru without the rulebook friction."

Value proposition 1: "One guided play table." Map, character state, dice, prompts, inventory, and journal live in one mobile-first flow.

Value proposition 2: "Faithful rules, lighter bookkeeping." The app handles procedure and state while the player keeps authorship.

Value proposition 3: "Easy to leave, easy to return." Autosave and run context make short sessions viable.

Feature description: "Next Day flow resolves the current tile, dice, event logic, survival needs, and journal prompt in sequence."

Objection handler: If a player worries this is not really solo RPG play, say: "Miru Digital does not replace your interpretation. It handles the parts you would otherwise track by hand."

### Elevator Pitches
**5 seconds:** Miru Digital is a guided mobile way to play the Miru solo RPG.

**30 seconds:** Miru Digital helps curious RPG players explore Miru without juggling a PDF, map, character sheet, dice roller, and notes app. It gives you one focused play table that knows the rules, tracks state, and guides the next day while leaving the story in your hands.

**2 minutes:** Solo pen-and-paper RPGs are full of interesting systems, but new players often bounce before the game opens up. They download a PDF, face setup, tables, dice, state tracking, and uncertainty, then drift back to digital games that teach themselves through play. Miru Digital brings Miru into a mobile-first guided play table. It handles the procedural load: map state, turn routing, dice, survival, combat math, inventory, saves, and journal prompts. The goal is not to turn Miru into a flashy mobile RPG. The goal is to preserve the analog solo ritual and remove the friction that keeps digitally native players from starting. The next step is a rights-aware private prototype that proves the first Next Day magic moment and gives the Miru creator or publisher something concrete to evaluate.

### Competitive Differentiation Narrative
Most digital tabletop tools win by being flexible. Miru Digital wins by being specific. A generic VTT can show a map, a dice roller can produce numbers, and a notes app can hold a journal, but none of them know when a Miru tile is old, when clarity matters, when an enemy remains after escape, or when camping must adjust starvation and sleep deprivation. That knowledge lets Miru Digital collapse a scattered analog workflow into one guided, quiet, mobile flow. It is not a better sandbox. It is a better doorway into this one game.

### Brand Anti-Patterns
Never use the language of mobile RPG monetization: no "daily rewards," "loot drops," "premium gems," or "limited-time bundles." Even if the app eventually charges money, the product should not borrow casino-shaped patterns.

Never turn combat or rewards into spectacle. Animations can clarify state changes, but they should not dominate interpretation.

Never make the UI feel like an enterprise dashboard. Avoid dense tables as primary surfaces, admin labels, generic CRUD screens, and status-heavy language.

Never ship public-facing Miru-branded materials before rights are clear. The brand should be respectful and conservative until the adaptation path is explicit.

## 5. Design Direction

### Design Philosophy
**Field tool, not fantasy interface.** The UI should feel like a practical object from the player's kit: map paper, pencil marks, compact instruments, and clear labels.

**Readable under interruption.** A player should understand state at a glance on a phone. Use hierarchy, stable spacing, and compact cards only where they frame repeated items or tools.

**Calm over cinematic.** Motion and visuals should help comprehension. Avoid gamey spectacle, visual noise, and reward theatrics.

**Touch-first precision.** Controls should be large enough for mobile use without making the play table feel childish.

### Visual Mood
The visual mood is an analog field kit: muted map-paper backgrounds, ink-like marks, restrained color accents for danger and resources, and sturdy readable type. Think a field notebook, a printed hex map, and a compact survival reference sheet rather than a fantasy RPG menu. The closest software reference is the clarity of a well-made productivity tool, but the materials should feel handmade and exploratory rather than corporate.

### Color Palette
| Role | CSS Variable | Tailwind Name | Hex | Use |
| --- | --- | --- | --- | --- |
| Background | `--color-background` | `field.background` | `#F3E8D0` | App body and broad page background |
| Surface | `--color-surface` | `field.surface` | `#FFF8E8` | Panels, sheets, and framed tools |
| Surface Muted | `--color-surface-muted` | `field.surfaceMuted` | `#E7D7B8` | Map cells, disabled panels, subtle section bands |
| Text | `--color-text` | `ink.text` | `#251F18` | Primary text and key labels |
| Text Muted | `--color-text-muted` | `ink.muted` | `#6F604B` | Secondary labels and helper copy |
| Border | `--color-border` | `ink.border` | `#B9A787` | Panel borders, dividers, hex outlines |
| Primary | `--color-primary` | `signal.primary` | `#2F5F4A` | Main actions, selected map states, progress |
| Primary Hover | `--color-primary-hover` | `signal.primaryHover` | `#244A3A` | Pressed or hovered primary actions |
| Secondary | `--color-secondary` | `signal.secondary` | `#8B5E34` | Inventory and field-kit accents |
| Accent | `--color-accent` | `signal.accent` | `#C47A3A` | Dice, discovery, active prompt highlights |
| Success | `--color-success` | `status.success` | `#3F6F4E` | Healing, completed steps, safe camp |
| Warning | `--color-warning` | `status.warning` | `#B7791F` | Low supplies, risky choices, pending survival |
| Error | `--color-error` | `status.error` | `#9F3A38` | HP loss, invalid actions, death states |
| Info | `--color-info` | `status.info` | `#3A5F7A` | Rules notes, context, neutral discoveries |

Light mode is the primary design target. Dark mode can be deferred; if added, it should use charcoal ink and dim parchment rather than blue-black sci-fi colors.

### Typography
Use `Fraunces` for headings, `Inter` for body text, and `IBM Plex Mono` for coordinates, dice, stat labels, and compact rule references. Load heading weights 600 and 700, body weights 400, 500, and 600, and mono weights 400 and 600.

Type scale: `--text-xs: 0.75rem`, `--text-sm: 0.875rem`, `--text-base: 1rem`, `--text-lg: 1.125rem`, `--text-xl: 1.25rem`, `--text-2xl: 1.5rem`, `--text-3xl: 1.875rem`. Body line-height should be 1.5. Compact labels can use 1.2. Headings should use 1.15 to 1.25. Letter spacing is 0.

### Spacing & Layout
Use a 4px base spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96. On mobile, the main play table should have 16px page padding, 12px gaps between compact controls, and at least 24px between major sections. The max content width for the primary app shell is 1120px on desktop, but the mobile layout is the source of truth.

Breakpoints: `sm: 480px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`. On mobile, use a single-column stacked play surface with sticky current action controls when helpful. On tablet and desktop, split map and state/prompt areas into a two-column layout without turning the page into a dashboard.

### Component Philosophy
Cards should be used for individual repeated items, modals, and genuinely framed tools such as current prompt, dice result, inventory item, or journal entry. Do not put cards inside cards. Page sections should be unframed or use full-width bands.

Border radius should stay restrained: `4px` for small controls, `6px` for cards and panels, `8px` maximum for modals. Shadows should be rare and soft; borders and background contrast should carry most hierarchy. Buttons should use clear iconography where possible, with text only when a command needs language. Inputs should feel like field-note lines rather than glossy forms.

### Iconography & Imagery
Use `lucide-react` for UI icons because it provides consistent outline icons and works well in React. Keep strokes at 1.75-2px. Use the existing Miru digital token assets for source-specific icons only after rights are clear for the intended use. For internal/private prototype work, keep source assets organized under `public/assets/source/` and document provenance.

Imagery should be concrete: map tiles, icons, tokens, journal marks, and source-inspired field textures. Avoid generic fantasy art, stock illustration, glowing gradients, and decorative blobs.

### Accessibility Commitments
Target WCAG 2.1 AA. Text contrast must be at least 4.5:1 for normal text and 3:1 for large text and meaningful UI graphics. Touch targets must be at least 44x44px. Every action available by touch must be keyboard accessible, with visible focus rings using `--color-info` or `--color-primary`.

Screen readers should be able to understand current day, current tile, HP/EP, active phase, dice result, and available choices. Do not rely on color alone for HP/EP, warnings, terrain, or status. Provide reduced motion support through `prefers-reduced-motion`.

### Motion & Interaction
Default transitions should be 120-180ms with `ease-out` for entrances and `ease-in-out` for state changes. Animate prompt changes, dice reveal, map tile selection, and save confirmation lightly. Do not animate HP loss, combat, or rewards in a way that feels celebratory or overproduced. Loading states should use skeletons or quiet inline status text rather than spinners where possible.

### Design Tokens
| Token | CSS Variable | Tailwind Class | Value |
| --- | --- | --- | --- |
| Background | `--color-background` | `bg-field-background` | `#F3E8D0` |
| Surface | `--color-surface` | `bg-field-surface` | `#FFF8E8` |
| Surface Muted | `--color-surface-muted` | `bg-field-surfaceMuted` | `#E7D7B8` |
| Text | `--color-text` | `text-ink-text` | `#251F18` |
| Text Muted | `--color-text-muted` | `text-ink-muted` | `#6F604B` |
| Border | `--color-border` | `border-ink-border` | `#B9A787` |
| Primary | `--color-primary` | `bg-signal-primary` | `#2F5F4A` |
| Accent | `--color-accent` | `text-signal-accent` | `#C47A3A` |
| Success | `--color-success` | `text-status-success` | `#3F6F4E` |
| Warning | `--color-warning` | `text-status-warning` | `#B7791F` |
| Error | `--color-error` | `text-status-error` | `#9F3A38` |
| Info | `--color-info` | `text-status-info` | `#3A5F7A` |
| Heading Font | `--font-heading` | `font-heading` | `Fraunces` |
| Body Font | `--font-body` | `font-body` | `Inter` |
| Mono Font | `--font-mono` | `font-mono` | `IBM Plex Mono` |
| Space 1 | `--space-1` | `p-1`, `gap-1` | `4px` |
| Space 2 | `--space-2` | `p-2`, `gap-2` | `8px` |
| Space 3 | `--space-3` | `p-3`, `gap-3` | `12px` |
| Space 4 | `--space-4` | `p-4`, `gap-4` | `16px` |
| Space 6 | `--space-6` | `p-6`, `gap-6` | `24px` |
| Space 8 | `--space-8` | `p-8`, `gap-8` | `32px` |
| Radius Small | `--radius-sm` | `rounded-sm` | `4px` |
| Radius Medium | `--radius-md` | `rounded-md` | `6px` |
| Radius Large | `--radius-lg` | `rounded-lg` | `8px` |
| Shadow Soft | `--shadow-soft` | `shadow-soft` | `0 8px 24px rgb(37 31 24 / 0.08)` |
| Transition Fast | `--transition-fast` | `duration-150` | `150ms ease-out` |
