# Spec 005: first-play puzzle tutorials

Status: written by Claude during the unattended run of 2026-10-20. Isaac reviews it later. Items marked DEFAULT were decided for him (handoff section 3). He can change them.

## 1. Goal
1. Each of the 20 puzzles has a short, interactive tutorial in the style of the B2 tutorial: a coach card, a spotlight ring on the real control, steps that finish when the player really does the thing, and practice that does not touch real progress.

## 2. Defaults chosen for Isaac (change here later)
1. DEFAULT: short text on the coach card is allowed. Title 4 words or fewer. Body 12 words or fewer. The spotlight and a moving hand lead. A test enforces the limit.
2. DEFAULT: `TUTORIAL_ALWAYS = true` in `product/ui/shell.js`. The tutorial shows on every play of every game. Set it to `false` to show it only on the first play (`seen` flag).
3. DEFAULT: a replay icon ("?") sits in the game top bar. It starts the tutorial at any time.
4. DEFAULT: leaving early asks "Leave the tutorial?". Leaving counts as seen. A reload restarts the tutorial at step 1 (it is not marked seen until finished or left).
5. DEFAULT: no chapter divider cards (a game has only 3 to 6 steps). The chapter name shows as a small label on the coach card.
6. DEFAULT: the practice level is the real level 1 of the game. Level 1 is the easiest level. Practice does not save level, stars, streak, or earned types. Stored answers are never shown.
7. DEFAULT: no "vibe" picker (YAGNI). Each tutorial wears its game class look.

## 3. Files
1. `product/ui/tutorial.js`: the engine (coach card, spotlight, hand, step runner, flags, default steps, CSS).
2. `product/ui/tutorials/<id>.js`: one file per game. It exports `steps` (an array). It runs no DOM code when imported.
3. `product/ui/tutorials/index.js`: registry `{ [id]: steps }`. Only the lead edits it.
4. `product/ui/tutorials/__tests__/steps.test.js`: checks word limits and step shape for every file.
5. `product/ui/shell.js`: the lead wires the engine (replay icon, practice mode, hud feed, solved hook). Agents do not edit `shell.js` or `games.js`.
6. Games change as little as possible. A game may add `data-tut="name"` to a key control so a step can find it. Steps may also find targets with plain selectors.

## 4. Step format
```js
{
  ch: 'Move',                       // chapter label
  title: 'Slide the red car',       // 4 words or fewer
  body: 'Drag it to the right.',    // 12 words or fewer
  target: ({ root, gv }) => element, // the real control to ring; null = no ring
  hand: [dx, dy],                   // optional: hand slides this many px (a drag); default = tap
  begin: (S) => snapshot,           // optional: runs when the step starts
  done: (S, snap) => boolean,       // the step ends when this is true
  lesson: true,                     // instead of done: a Next button
}
```
`S` is the live state: `moves`, `best`, `canUndo`, `tries`, `maxTries`, `undos`, `resets`, `solved`, `score`, `stars`, `root` (game stage), `gv` (game screen). The engine reads `S` from the `ctx.hud` stream and from clicks on undo and reset. Steps never read stored level data.

## 5. Behavior
1. The coach card sits at the bottom (top when the target is in the lower half). It shows chapter, segment progress bar, title, body, Exit, and Next or Skip.
2. The spotlight ring follows the target each frame. The rest is dimmed. The dim does not block touches.
3. A step ends by itself when `done` is true. A short pause, then the next step.
4. The last step is "solve the practice level". Then a "complete" card shows the stars. A button returns to the real game.
5. `prefers-reduced-motion`: no pulse, no hand motion.
6. Class look: Space warm cartoon (thick border, bounce); Quantity thin and cool; Direction dusk glow; Sequence blueprint dashed white lines.
7. Tap targets 44 px or more. Works at 390 and 360 px, light and dark.
8. Storage: `localStorage` key `puzzle-app-tutorial-v1`, `{ [id]: true }`, with a memory fallback.

## 6. Default steps
A game without its own file gets 4 default steps: goal card, one move, undo, solve. Games with limited tries (no undo) need their own file.

## 7. Per-game step count (planned)
| game | steps | note |
|---|---|---|
| traffic-jam | 5 | goal, drag red car, blocked car, undo, solve |
| lights-out | 5 | goal, tap a bulb, neighbors flip, undo, solve |
| other 18 | 3 to 6 | written by agents in pairs, listed in the progress file |

## 8. Order of work
1. Engine and shell wiring (lead). 2. Prove on traffic-jam and lights-out. 3. Other 18 games in pairs (max 2 agents). 4. Test every game with real pointer events in headless Chrome (390 px, light and dark, reduced motion once). 5. Rebundle and republish. 6. HANDOFF.md "Tutorial" section.

## 9. Not verified (to report)
Real phone, Safari, sound by ear, the claude.ai viewer.
