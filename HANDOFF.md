# Handoff: Puzzle app (MSB 341 Sprint 3)

Written 2026-10-20. Read this first in the new window. Then read `CLAUDE.md`, `specs/001-game-logic-contract.md`, `specs/002-game-rules.md`, and `design/puzzle-app-design-checklist.md`.

## Goal
1. Sprint 3 goal: 30 puzzles, playable, working and beautiful UI. Done = Isaac plays each day without it breaking, and one other person joins.
2. Product: a phone web app. A new puzzle type each day Isaac finishes all his puzzles. Not finishing removes the newest earned type (he can earn it back or choose a new type). 7 days in a row of earning = 1 freeze (a freeze protects a missed day; he can hold more than one).
3. Feel: flowy like Monument Valley and Alto's Adventure. No fail screens.

## Decisions already made (do not re-ask)
4. 20 puzzle types in 4 classes (list in `specs/002-game-rules.md`): Space, Quantity, Direction, Sequence.
5. Class looks: Space = cartoon, warm. Quantity = sleek, minimal, cool. Direction = 3D (assumed isometric, like Monument Valley; Isaac's note was cut off). Sequence = spongey jelly pieces on a blueprint.
6. Bag-draw keeps its luck and is called a skill game. Laser and bag-draw have limited tries; all other games have free undo.
7. Every game tracks tries/moves and gives 1 to 3 stars against the best known score.
8. Pentomino game is a 5x5 square with some pieces already placed.
9. No words inside puzzles. Visual only. One player.
10. Phone browser. Static HTML/CSS/JS, no build step, no new dependencies without asking.
11. Isaac builds ONE game of each class first, then adds rules, then the rest. First four: Traffic Jam (Space), Knapsack (Quantity), Mirror & Laser (Direction), Lights Out (Sequence). I chose these; Isaac may swap.
12. Home page: a very simple list. Each game is a large message-style box with a thumbnail and a title. Grey = locked. Blue and iced = frozen. Checked = done. Bright class color = available but not done.

## Where things stand
13. Folder: `/Users/isaackaufman/Downloads/School/puzzle-app` (copy of the class template, fresh local git repo, one local commit). NOT pushed anywhere. No GitHub repo exists yet.
14. Design checklist (82 items): `design/puzzle-app-design-checklist.md`. Isaac has NOT marked it yet.
15. Home page + 4 thumbnails preview: `design/home-preview.html`. Published as a private artifact: https://claude.ai/artifact/Ppwv6PvJFWsHDeBNJiJUpY . Isaac has NOT checked it yet. Wait for his feedback before the larger UI build.
16. Logic layer: DONE in `product/logic/` (shared `history.js`, `rating.js`, helpers `solve.js`, `testkit.js`, `poly.js`, 20 game modules, 149 tests, all pass on a run I did myself). Read `product/logic/STATUS.md` for every rule choice. Run tests with `node --test 'product/logic/**/*.test.js'` from the puzzle-app folder (a plain folder path fails on Node 25.8). Level data contains answers (`solution`, hidden weights), so the UI must never show them. Redesign ideas for Sokoban and Knapsack are not built. Mirror-laser and breach-turns use "best known" scores, not proven minimums. Several rules are simplified readings (for example Lemmings-type is one row; Monument path uses 4 view turns): Isaac should review them in STATUS.md.
17. Notion "Puzzle Ideas" page (id `3f80184d-66e4-80b1-815b-fba675610ed3`) holds the earlier 20-game list and progression rules. It is slightly out of date (pentomino says 6x6 in places; now 5x5).

## Update 2026-10-20 (later)
- First four games are PLAYABLE: `product/ui/{traffic-jam,knapsack,mirror-laser,lights-out}.js` (spec `specs/003-game-ui-contract.md`), shell `product/ui/shell.js`, registry `product/ui/games.js`, entry `product/index.html`. Local dev: serve `product/` with any static server.
- Phone preview: `node tools/bundle.mjs` makes `dist/puzzles-artifact.html` (one file); published as artifact https://claude.ai/artifact/Y9P4mcEMCajRkeEt2WiHM9 (publish the same file path to update). Home design preview: https://claude.ai/artifact/Ppwv6PvJFWsHDeBNJiJUpY (`design/home-preview.html`). Isaac was emailed both links.
- Fixed a logic bug: the `\` mirror reversed the beam; now `BOUNCE = [[1,0,3,2],[3,2,1,0]]` in `product/logic/mirror-laser.js` (150 tests pass).
- `ui/home-css.js` and `ui/thumbs.js` are COPIES of `design/home-preview.html`; re-copy after preview edits.
- Not verified: the artifact running inside the real claude.ai viewer, dark mode of games, reduce-motion, 360 px width, sounds. Mirror-laser tiles are ~42 px tall (under the 44 px target).
- Waiting on Isaac's feedback per game, his design-checklist check-off, and his rule changes (spec 002).

## Next steps, in order
18. Get Isaac's feedback on the thumbnails and home list (item 15) and the design checklist (item 14). Apply it.
19. Check `product/logic/STATUS.md`; fix or finish any partial game.
20. Build the first four playable games in `product/` using the logic modules and the class looks from the checklist. Test each at 390 px phone width and in light and dark.
21. Write the rule additions Isaac sends into `specs/002-game-rules.md` first, then change the logic.
22. Build the home screen for real (state per game: locked, available, frozen, done) and the unlock/freeze logic. Needs its own spec in `specs/` first (003).
23. Direction class decision: a 3D library, or fake isometric with SVG/canvas. Ask Isaac before adding a library.
24. Create the GitHub repo per class standards. Ask Isaac first (outward-facing). Share it with `sdmurff` (class rule). Vercel deploy: team "Life", commits authored as ij.kaufman@gmail.com.
25. Sprint 3 plan (`sprints/sprint-3-plan.md`) does not yet have the brainstorm section Isaac asked for. Add it with `/sprint-plan` or by hand. Run `/sprint-plan` again if the plan changes.
26. Class deliverables: Plan (commit + Canvas link), Output, Review (`/sprint-review` by the Monday the sprint ends, 11:59 PM; Sprint 3 target date is Monday 10/26), and a 60 to 90 second Loom demo.

## Open questions for Isaac
27. Does he want the four first games as chosen (item 11)?
28. Direction class: confirm "isometric 3D". Is the 3D-library cost acceptable?
29. 20 types is short of 30 puzzles. More types from him later, or 1 to 2 levels per type? (The logic spec already asks for 3 levels per game.)

## Working rules from Isaac (keep)
30. Simple Technical English for explanations. YAGNI. Surgical changes. Ask before large refactors.
31. Number lists continuously across headings; do not restart under each heading.
32. Confirm before paid actions and before anything outward-facing. Do not commit or push unless he asks (a first local scaffold commit was made without being asked; tell him if he cares).
33. Long handoffs go in a file and the path is shared in chat.
34. Use model-router for large research/study builds; do not use Opus unless a part is truly hard (tell him if you do).

## Update 2026-10-20 (difficulty + design loop)
35. Isaac asked: (a) make ALL games harder, (b) loop 3 design passes on the built games against "meets and exceeds the unique vibe and personality of the design class", (c) hand off, (d) build the rest of the games.
36. Difficulty (a): every logic module now targets 5 levels with a rising curve. Done and tested: traffic-jam (9..35 moves), knapsack (8..14 items), lights-out (9..14 presses), mirror-laser (6x6..9x9), golf-tee (10..31), build-square (4..9), pentomino-5x5 (3..5), breach-turns (5..12), hanoi (to 127), balance-scale, shape-sudoku (unique solutions), monument-path, network-flow (min-cost-flow bestScore), lemmings-tools, tower-fall, matrix-reasoning, domino-logic. A last agent was finishing sokoban, resource-allocation and bag-draw; check `product/logic/STATUS.md` rows and run `cd product/logic && node --test` (was 156 pass).
37. Mirror-laser UI viewBox now widens with grid size (9x9 fits). Rule choices that changed level data are in STATUS.md.
38. Design loop (b): pass log is below (added as each pass ends).
39. Next: build UI for the remaining 16 games (max 2 agents at once; one UI file per game per spec 003; register in `product/ui/games.js`; rebundle with `node tools/bundle.mjs`; republish `dist/puzzles-artifact.html` to artifact https://claude.ai/artifact/Y9P4mcEMCajRkeEt2WiHM9).

### Design loop log (item 38)
40. Pass 1-3 done for the four built games (2026-10-20). Summary of what each pass added (details in the agents' reports are not kept; read the UI files):
   - Traffic Jam: faces/wheels, wooden tray, bounce, confetti; vehicle types with own sounds, birds, boom gate, night mode; hero glow + sparkle trail, soft shadows, heavier trucks/bus.
   - Knapsack: thin numerals, wave water; odometer, 44 px bag items, tier colors+rings, own sounds; balloon carries the bag and lifts off on win, icon legend.
   - Mirror & Laser: depth shading, bloom, moon/motes; see-through walls + beacon, vibraphone voice, 9x9 perf; tap-picker for 7x7+ boards, drag-tilt room, ambient wind/pad, one win chord (overrides ctx.sound.win while mounted).
   - Lights Out: glossy jelly, blueprint texture, drafting motion; jelly strands, rewind tape; held-bulb soft body, scrub tape with real mini-maps, string bed, ink-draw load.
41. Spec 003 deviations to decide: games make their own Web Audio (shell only offers the class scale); mirror-laser.js is ~556 lines (limit 500); mirror-laser overrides ctx.sound.win; mirror-laser 2nd mirror orientation costs 3 moves in logic (place, remove, place).
42. Leftovers: shell win card (700 ms) covers the finale animations (TJ exit, Knapsack liftoff); 9x9 mirror tiles 36-39 px; no true 4-view rotation; Safari/real phone untested; audio untested by ear; dist/ not yet rebundled/republished.
43. All 20 logic modules now have 5 levels (sokoban 23..87 moves, resource-allocation 3..6, bag-draw 5..9, build-square 4..9, pentomino 3..5, breach 5..12). 159 tests pass (sokoban level 5 makes the suite take ~200 s).
44. Remaining UI build, two games per agent (Space batch: golf-tee+sokoban, build-square+pentomino-5x5; Quantity: bag-draw+resource-allocation, balance-scale+shape-sudoku; Direction: monument-path+network-flow, lemmings-tools+breach-turns? (breach is Sequence); Sequence: breach-turns, hanoi, tower-fall, matrix-reasoning, domino-logic). Register finished ones in `product/ui/games.js` by hand.

## Update 2026-10-20 (all 20 UIs built)
45. All 20 games have a UI in `product/ui/` and are registered in `ui/games.js`. Bundle: `node tools/bundle.mjs` (48 modules, 586 KB). Playable artifact (version 3): https://claude.ai/artifact/Y9P4mcEMCajRkeEt2WiHM9. Logic tests: 159 pass (`cd product/logic && node --test`, ~200 s because of sokoban level 5).
46. Each agent played every level (most) to a solve with real pointer events in headless Chrome at 390 px. NOT verified: real phone/Safari, audio by ear, 360 px for some, the claude.ai viewer, the real shell win card (700 ms delay covers finales).
47. Known gaps to fix next:
   - Home thumbnails now exist for all 20 games: first 4 in `ui/thumbs.js` (copy of design/home-preview.html), 8 in `ui/thumbs-a.js` (Space+Quantity), 8 in `ui/thumbs-b.js` (Direction+Sequence); `ui/shell.js` merges them. design/home-preview.html does NOT yet show the 16 new ones. Daily progression is BUILT per specs/004 (`ui/progress.js`, 11 tests in `ui/__tests__/progress.test.js`, wired in shell.js). `TEST_OPEN_ALL = true` in shell.js opens all 20 games for testing; add `#real` to the URL (or set the flag false) to see real progression (4 available, 16 locked).
   - Spec 003 deviations: games own their Web Audio; mirror-laser, monument-path, network-flow silence ctx.sound.win while mounted (better: a shell flag); mirror-laser.js 556 lines.
   - Tap targets under 44 px: sokoban 11-column levels (29 px, d-pad is the main control), mirror-laser 7x7+ (picker used), network-flow level 5 valves overlap, lemmings ~44 px.
   - Logic notes: bag-draw has one winning draw per level (luck almost empty; decide); bag-draw soft restart adds earlier moves; shape-sudoku header vs STATUS.md level sizes differ; STATUS.md hanoi line says 3-5 pegs, code is 3-4 pegs/4-7 discs; domino-logic wrong guesses are UI-only (no undo); turn-tactics unit moves ignore paths; monument-path hidden blocks count as adjacent; mirror 2nd orientation costs 3 moves.
   - 20 types < 30 puzzles goal: each type has 5 levels = 100 levels, so the 30-puzzle goal is met by levels; more types from Isaac optional.
   - Duplicated code (audio, tape) across lights-out/breach/hanoi; tower-fall and lemmings copy the logic run loop.
48. Still to do: Isaac's feedback + checklist check-off, GitHub repo (ask first), sprint plan brainstorm section, Loom, `/sprint-review` by Mon 10/26. Nothing committed since the first scaffold commit; ask before committing.

49. Thumbnail weak spots: pentomino and shape-sudoku shapes small; balance-scale reads as a generic balance; sokoban right wall cropped; lemmings-tools least recognizable; domino pips ~5 px; tower-fall wave pips tiny. Artifact is at version 4 with all thumbnails.

50. Repo: https://github.com/bubbarand/puzzle-app (private, pushed; sdmurff invited with write access, must accept). design/home-preview.html now shows all 20 thumbnails (artifact version updated). Title CSS fixed in both preview and home-css.js (title max-width 50%, done-row title 1.05rem).
51. Progression decisions (spec 004 gaps filled by the builder): a type earned on day D is playable from D+1 (`availableFrom`); reconcile walks every missed day from lastDay inclusive; `earnedOn` set whenever all playable types are done; pressing next level resets done. Not handled: hash change re-render; day rollover while the app stays open.
52. Still Isaac's: mark the design checklist; answer open decisions in items 41 and 47; accept the sdmurff invite flow if needed; Loom + /sprint-review by Mon 10/26. Not built: choose-a-new-type screen, Vercel deploy, real-phone test, second player.
