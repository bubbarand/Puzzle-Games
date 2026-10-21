# Status of product/logic

Run the tests with `cd product/logic && node --test` or `node --test 'product/logic/**/*.test.js'` from puzzle-app. Note: `node --test product/logic` (a plain folder path) fails on Node 25.8 because Node treats the folder as a file, not a search path. Total: 149 tests, all pass.

Shared files: `history.js`, `rating.js` (tests in `__tests__/shared.test.js`, 3 tests); helpers `solve.js` (BFS, seeded random), `testkit.js` (shared contract tests), `poly.js` (tiling rules for build-square and pentomino-5x5); `package.json` sets ES modules. Helpers are extra to the contract.

Each line: game, status, levels tested, tests, how bestScore is found. Every game passes the shared tests: exports, deterministic plain-JSON levels, no mutation, every level solvable, bestScore matches, rating and history.

| Game | Status | Levels | Tests | bestScore |
|---|---|---|---|---|
| traffic-jam | done | 3 | 7 | BFS |
| knapsack | done | 5 | 6 | subset search (generated levels, any n) |
| mirror-laser | done | 3 | 8 | stored solution (search-verified, best known) |
| lights-out | done | 6 | 8 | exact (first-row chase; generated levels, any n) |
| golf-tee | done | 4 | 7 | BFS |
| build-square | done | 5 | 7 | stored tiling (pieces to place) |
| sokoban | done | 5 | 8 | BFS (min moves 23, 41, 47, 67, 87; level 5 solve takes about 20 s) |
| pentomino-5x5 | done | 5 | 7 | stored tiling (pieces to place) |
| bag-draw | done | 5 | 8 | BFS (draws are seeded; n 4 to 8, min moves 5 to 9) |
| resource-allocation | done | 5 | 8 | BFS (4 to 6 options, min moves 3, 4, 4, 5, 6) |
| balance-scale | done | 3 | 7 | BFS |
| shape-sudoku | done | 5 | 7 | stored solution (generated levels, any n) |
| monument-path | done | 3 | 7 | BFS |
| network-flow | done | 3 | 8 | BFS |
| lemmings-tools | done | 4 | 8 | BFS |
| breach-turns | done | 5 | 9 | stored solution (search-verified, best known) |
| hanoi | done | 5 | 7 | BFS |
| tower-fall | done | 3 | 8 | BFS |
| matrix-reasoning | done | 6 | 7 | 1 (generated levels, any n) |
| domino-logic | done | 6 | 7 | 1 (generated levels, any n) |

## RULE CHOICE lines (one per game, copied from the top of each file)

- **traffic-jam**: a move slides one car any number of free cells (counts as 1 move); car 0 is the red car and exits at the right edge.
- **knapsack**: the target is the best value that fits the weight limit; each tap on an item (in or out) is one move.
- **mirror-laser**: a mirror may not sit on the laser, a wall, the target or a checkpoint; place, remove and submit each count as one move; "solved" needs the beam to touch the target and every checkpoint.
- **lights-out**: 5x5 always; level n makes the puzzle with min(2+2n, 14) seeded random presses from solved, and it is never already solved.
- **golf-tee**: jumps are along the board's own direction list (square boards: 4 directions; triangle boards: 6); a jump is one move; solved = exactly one peg left.
- **build-square**: pieces may rotate but not flip; "square" levels also include a pyramid outline; a move places or removes one piece; fixed pieces never move.
- **sokoban**: classic rules for every level (no changing crates); a move is one step or one push, 4 directions numbered 0 up, 1 right, 2 down, 3 left.
- **pentomino-5x5**: pieces may rotate but not flip; a move places or removes one piece; fixed pieces never move.
- **bag-draw**: the bag holds at most cap tiles; a draw takes n tiles at random from it (seeded from the level and the draw number, so it repeats); solved when the drawn sum >= target; 3 draws in total.
- **resource-allocation**: one move sets how many coins sit on one option (0 to 10); solved needs all 10 coins placed, total return >= target and worst-year total >= floor. The risk number is display only (largest one-year loss per coin).
- **balance-scale**: the final left pan is fixed; you load shapes from a limited stock onto the right pan, one shape per move (add or take back), and solved = both pans equal weight with something on the right. Hidden weights w are in the data for the rules check only.
- **shape-sudoku**: shapes are the numbers 1 to size; a move fills one empty cell and is only legal if the shape is not already in that row or column; levels 1-2 are 4x4, level 3 and up are 6x6.
- **monument-path**: blocks are [x, y, z] cells (y is height). The view turns in 4 steps; in view v the screen position is u (x, z, -x, -z) and height y. You may walk between two blocks that look adjacent on screen: u differs by 1 and height differs by at most 1. Blocks that are stacked behind each other (same u) are not connected. A turn and a walk each count as one move.
- **network-flow**: pipes are one-way (first node to second node); one move adds or removes 1 unit of flow on one pipe; node 0 is the source; solved = every other non-sink node passes on all it gets and every sink keeps exactly its demand.
- **lemmings-tools**: one row of cells (0 floor, 1 pit, 2 wall, 3 exit). Creatures walk right one at a time from the spawn cell. A wall turns them around; a pit or the board edge kills them. Tools: 0 bridge (fills a pit), 1 digger (removes a wall), 2 arrow (on a floor cell, turns a right-walking creature to the left), 3 blocker (on a floor cell, the first creature to reach it stays there for good and turns into a wall). The run is deterministic; a creature still walking after 200 steps is lost.
- **breach-turns**: a unit moves to any empty cell within 3 steps (no path needed), then may punch one adjacent enemy, pushing it 1 cell (a push into another enemy kills both; into a wall, building or unit it does nothing). Enemies stand still, hit the cell they face when the turn ends (building, unit or enemy dies), then turn clockwise. Each act and each end of turn is one move; solved = the turn limit is reached with enough buildings.
- **hanoi**: the goal is all discs on the last peg; levels go from 3 pegs/3 discs up to 5 pegs/5 discs.
- **tower-fall**: enemies walk a straight path of len cells at 1 cell per tick. A tower on slot p hits the front-most enemy within 1 cell of p for 1 damage each tick (towers fire in slot order, before enemies move). An enemy that walks off the end is a leak; solved = leaks < lives. Placing, removing and running each count as one move.
- **matrix-reasoning**: a cell is [count, rotation, fill] with moduli 3, 4, 3; each attribute follows (a0 + across*col + down*row) mod modulus; the missing cell is always the bottom right; more attributes vary in later levels.
- **domino-logic**: pips are 0 to 6; the rule is the same for the whole chain (0 every domino sums to p, 1 every domino differs by p with the second half larger, 2 domino sums grow by p each step); the last domino's second half is empty and you set it in one move.

## TODO / notes

- No TODOs: no game was skipped or partial.
- sokoban: the 'crate changes kind after each push' redesign idea is not built; levels 1 to 3 use the classic rule as the spec says.
- knapsack: the balloon redesign idea is not built.
- mirror-laser, breach-turns: bestScore is the best known solution found by search, not a proven minimum (state space too large for BFS).
- bag-draw: 'add or swap' is done as add and take-out moves; a swap is two moves.
- tower-fall and lemmings-tools: reduced to a one-row path; creatures and enemies never interact except as written in the RULE CHOICE.
- Level data holds `solution` (and balance-scale `w`, domino-logic `rule`, matrix-reasoning `rules`) so the logic can check answers. The UI must not show these fields.
