# Spec 001: Game logic contract

Status: draft, written before building. Owner: Isaac. Applies to all 20 puzzle types.

## Why
The UI (look, motion, sound) changes often. The rules should not. Each game's rules live in one plain
JavaScript module with no UI code, so the same module can be tested in Node and used by the page.

## Where
- `product/logic/<id>.js`: one ES module per game (ids below).
- `product/logic/history.js`: shared undo/reset/try counting (all games use it).
- `product/logic/rating.js`: shared star rating.
- `product/logic/__tests__/<id>.test.js`: tests using `node --test` (built into Node; no dependencies).

## Module exports (every game)
- `meta`: `{ id, title, cls }` where `cls` is `space`, `quantity`, `direction`, or `sequence`.
- `makeLevel(n)`: level `n` (integer, 1 and up). Pure and deterministic. Luck games take a seed from `n`.
- `initialState(level)`: the starting state. Plain JSON data only.
- `legalMoves(state)`: array of move objects (may be large; allowed to be a function of the state only).
- `applyMove(state, move)`: returns a NEW state, or `null` if the move is illegal. Never mutate.
- `isSolved(state)`: true or false.
- `bestScore(level)`: the best known score (fewest moves) or `null` if unknown. Use a solver (BFS/DFS) when the state space is small.
- `score(state)`: the player's score so far (usually moves used).
- `maxTries(level)`: `Infinity` for free-undo games, a number for limited-tries games (laser, bag-draw).

## Shared rules
- Rating: 3 stars at best score, 2 stars within 20 percent, 1 star for any solve, 0 if not solved.
- Free undo for all games except laser and bag-draw (see `maxTries`).
- No words in any level data. Numbers and symbols only.
- Every game ships at least 3 levels, easy to hard, and a test that proves each level is solvable.
- Bag-draw keeps its luck. Seed from the level number so a level repeats.

## Game ids
Space: `traffic-jam`, `golf-tee`, `build-square`, `sokoban`, `pentomino-5x5`
Quantity: `bag-draw`, `knapsack`, `resource-allocation`, `balance-scale`, `shape-sudoku`
Direction: `mirror-laser`, `monument-path`, `network-flow`, `lemmings-tools`
Sequence: `breach-turns`, `lights-out`, `hanoi`, `tower-fall`, `matrix-reasoning`, `domino-logic`

## Not in this spec
Visuals, sound, animation, unlock/freeze rules, accounts. Those are separate specs.
