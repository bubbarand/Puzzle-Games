# Tutorial progress (single source of truth; update after every milestone)

Started 2026-10-20. Handoff: ~/Downloads/puzzle-app-tutorial-handoff.md. Spec: specs/005-puzzle-tutorials.md.

## Status table
Columns: steps = step data written; wired = engine connected; tested = played with real pointer events in Chrome; shots = screenshots seen.

| game id | steps | wired | tested | shots | notes |
|---|---|---|---|---|---|
| traffic-jam | yes | yes | light + dark/reduced PASS | yes | proof game 1 done; test: tools/tut/traffic-jam.mjs |
| lights-out | yes | yes | light + dark/reduced PASS | yes | proof game 2 done; test: tools/tut/lights-out.mjs |
| golf-tee | yes | yes | light + dark/reduced PASS | no | agent-written; test tools/tut/golf-tee.mjs |
| build-square | yes | yes | light + dark/reduced PASS | no | agent-written; test tools/tut/build-square.mjs |
| sokoban | yes | yes | light + dark/reduced PASS | no | agent-written; test tools/tut/sokoban.mjs |
| pentomino-5x5 | yes | yes | light + dark/reduced PASS | no | agent-written; test tools/tut/pentomino-5x5.mjs |
| knapsack | yes | yes | light + dark/reduced PASS | agent saw | test tools/tut/knapsack.mjs |
| bag-draw | yes | yes | light + dark/reduced PASS | agent saw | test tools/tut/bag-draw.mjs |
| resource-allocation | yes | yes | light + dark/reduced PASS | agent saw | test tools/tut/resource-allocation.mjs |
| balance-scale | yes | yes | light + dark/reduced PASS | agent saw | test tools/tut/balance-scale.mjs |
| shape-sudoku | yes | yes | light + dark/reduced PASS | no | tools/tut/shape-sudoku.mjs |
| mirror-laser | yes | yes | light + dark/reduced PASS | no | tools/tut/mirror-laser.mjs |
| monument-path | yes | yes | light + dark/reduced PASS | no | tools/tut/monument-path.mjs |
| network-flow | yes | yes | light + dark/reduced PASS | no | tools/tut/network-flow.mjs |
| lemmings-tools | yes | yes | light + dark/reduced PASS | no | tools/tut/lemmings-tools.mjs |
| breach-turns | yes | yes | light + dark/reduced PASS | no | tools/tut/breach-turns.mjs |
| hanoi | yes | yes | light + dark/reduced PASS | no | tools/tut/hanoi.mjs |
| tower-fall | yes | yes | light + dark/reduced PASS | no | tools/tut/tower-fall.mjs |
| matrix-reasoning | yes | yes | light + dark/reduced PASS | no | tools/tut/matrix-reasoning.mjs |
| domino-logic | yes | yes | light + dark/reduced PASS | no | tools/tut/domino-logic.mjs |

## Decisions made
1. Defaults from handoff section 3 (short text <= 12 words; TUTORIAL_ALWAYS = true; replay icon; no commit/push).

## Next 3 actions
1. Run agent rounds (2 games per agent, max 2 agents). Pairs: A golf-tee+sokoban, B build-square+pentomino-5x5, C knapsack+bag-draw, D resource-allocation+balance-scale, E shape-sudoku+mirror-laser, F monument-path+network-flow, G lemmings-tools+breach-turns, H hanoi+tower-fall, I matrix-reasoning+domino-logic. Rounds: (A,B) (C,D) (E,F) (G,H) (I).
2. After each agent report: add its games to product/ui/tutorials/index.js, run `node --test product/ui/tutorials/__tests__/steps.test.js`, re-run its tools/tut/<id>.mjs once myself.
3. End: bundle, republish, HANDOFF.md Tutorial section, final message.

## Agents
Agent prompt file: /private/tmp/claude-501/-Users-isaackaufman/bcfb4081-c4f8-4514-8f1c-040c40eab7d7/scratchpad/agent-prompt.md (replace {GAMES}).
- Round 1 launched: agent A (id ac01f003b8b74be78) golf-tee + sokoban; agent B (id acc69888fe06745e1) build-square + pentomino-5x5. Waiting for reports.

## Log
- DONE: dark+reduced sweep 14/14 PASS; bundle ok (73 modules, tutorial starts in bundle); artifact republished (version 6); HANDOFF.md items 53-59 written. Only the final message to Isaac remains.
- ALL 20 light PASS (lead re-ran; matrix/domino test fixed: check .mx-tried persistent class). Running dark+reduced sweep for the other 14 games in background -> scratchpad/dr.log. Then bundle, republish, HANDOFF.md, final message.
- All 20 games wired in index.js (steps.test.js 21 pass). Agent X report: hanoi light PASS (agent); lemmings-tools + breach-turns light PASS (lead). Lead now re-running matrix-reasoning, domino-logic, hanoi, tower-fall light (bg). After: dark+reduced sweep all 20 (one at a time, check df), bundle, republish, HANDOFF.md Tutorial section, final message.
- Agent Y report: tower-fall light PASS (agent); matrix-reasoning + domino-logic steps+tests written, NOT run (disk low, 200-370 MB free). Files in repo, not yet in index.js. Waiting for agent X, then run matrix/domino tests one at a time. Stale tutchrome dirs: delete only those with no live process.
- Final agents launched: X (id a500fc2f48453b321) lemmings-tools+breach-turns+hanoi; Y (id a3088fe08872e9728) tower-fall+matrix-reasoning+domino-logic. On report: wire index.js, steps.test.js, light re-run; then sweep dark+reduced all 20, bundle, republish, HANDOFF.md, final message.
- shape-sudoku, mirror-laser (test fix: .ml-t is diagonal order, not row-major), monument-path, network-flow: all light PASS re-run by lead, wired in index.js (16 games wired). Launching final 6 as 2 agents x 3 games (usage saving): X lemmings-tools+breach-turns+hanoi; Y tower-fall+matrix-reasoning+domino-logic.
- Resumed after breaker. lib.mjs now spawns Chrome detached and kills the process group (parses OK). Cleared leaked Chrome (35 procs) + profiles. Rounds A-F done (reports in). Table below for rows shape-sudoku..network-flow was updated here: shape-sudoku steps+test written, light PASS (agent), wiring now; mirror-laser steps+test written, NOT yet passing (lost 2nd mirror tap; fix = longer pause); monument-path + network-flow wired, light PASS (agent). Remaining: rounds G (lemmings-tools+breach-turns), H (hanoi+tower-fall), I (matrix-reasoning+domino-logic); final sweep dark+reduced; bundle; republish; HANDOFF.md; final message.
- Round 3 launched: agent E (id a324cc43194a0b5e5) shape-sudoku+mirror-laser; agent F (id a8acac1ed7d9ba6d9) monument-path+network-flow. Disk 1.2 GB free (watch it; stale tutchrome-* dirs are mine to delete).
- Round 2 reports in (C, D). Wired knapsack, bag-draw, resource-allocation, balance-scale. Resource-allocation.js has a data-tut rect added. Round 3 next: E shape-sudoku+mirror-laser, F monument-path+network-flow.
- Round 2 launched: agent C (id a687a5c64d5c8db2f) knapsack+bag-draw; agent D (id a82c97e1ae11f6729) resource-allocation+balance-scale. On report: wire index.js, run steps.test.js, re-run light test.
- Round 1 verified (light PASS x4). lib.mjs fixed: profile cleanup with retries, scrollIntoView for rows low in the list. Dark/reduced for all games will run in one final sweep. Round 2 launching: C knapsack+bag-draw, D resource-allocation+balance-scale.
- 2026-10-21: disk was full (leftover tutchrome-* Chrome profiles, 1 GB; deleted, lib.mjs now removes its own profile on close). Agents A+B reports in: step files + tests written for golf-tee, sokoban, build-square, pentomino-5x5; all 4 wired in tutorials/index.js; steps.test.js passes (7). I am re-running their light tests (round 1 verify). Dark/reduced for these 4 still to run. Agent B added data-tut="board" to build-square.js and pentomino-5x5.js.
- Progress file created.
- Spec 005 written. Engine product/ui/tutorial.js built, wired in shell.js (TUTORIAL_ALWAYS, ? button, practice = level 1, no progress save). tools/tut/lib.mjs = CDP test driver. traffic-jam + lights-out proven (real pointer events, light/dark/reduced). Default steps (tutorial.js) used for games without own file.
2. Test is flaky once in a while on launch (Chrome start race): just re-run. Run `pkill -f tutchrome-` after each test.
