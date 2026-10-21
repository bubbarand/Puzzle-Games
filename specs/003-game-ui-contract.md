# Spec 003: Game screen (UI) contract

Status: draft. Applies to every playable game. The logic layer (spec 001) stays UI-free; each game has one UI module.

## Where
- `product/ui/<id>.js`: one ES module per game (same ids as the logic modules).
- The shell (`product/index.html` and `product/ui/shell.js`) shows the home list, the top bar, the win screen, and mounts the game.

## Module exports
```js
import * as logic from '../logic/<id>.js';
import { newHistory, play, undo, reset } from '../logic/history.js';

export const css = `...`;                 // all CSS for this game. Every selector starts with `.g-<id>`.
export function mount(root, ctx) { ... }   // returns { undo(), reset(), destroy() }
```
`root` is an empty block element. Add class `g-<id>` to it. The game fills the width of the phone (about 360 px) and about 60 to 70 percent of the screen height. Paint your own background across the whole `root`.

`ctx` (given by the shell):
- `ctx.level`: level number, 1 and up. Use `logic.makeLevel(ctx.level)` and `logic.initialState(level)`.
- `ctx.hud({ moves, best, tries, maxTries, canUndo })`: call after every change. `best` is `logic.bestScore(level)`. For free-undo games `maxTries` is `Infinity`.
- `ctx.solved({ score })`: call ONCE when `logic.isSolved(state)` becomes true, about 700 ms after the last move (let the celebration play first).
- `ctx.sound.move(i)`: play one note of the class scale (`i` is any integer; it wraps). `ctx.sound.win()`: a short chord. Sound starts only after the first tap; the shell handles that.
- `ctx.reduceMotion`: true when the phone asks for less motion. Then skip loops, parallax, and particles. Short fades (under 150 ms) are fine.

`undo()` and `reset()` use `history.js`. Limited-tries games (`logic.maxTries() !== Infinity`) ignore undo and reset (history.js already does that).

## Rules for all games
1. Phone first. Touch and mouse both work (use pointer events). Every tap target is at least 44 px. No hover-only controls. Test at 390 px and 360 px wide.
2. No words inside the puzzle. Numbers and icons only.
3. Never show answer fields from level data (`solution`, hidden weights, hidden rules).
4. No fail screen. A bad result shows fewer stars. Limited-tries games show tries as small dots that fade.
5. Every change eases: cubic-out, 250 to 400 ms. Nothing snaps without motion.
6. Backgrounds drift slowly in 2 or 3 parallax layers (skip when `ctx.reduceMotion`).
7. Each move calls `ctx.sound.move`. A solve calls `ctx.sound.win`.
8. Colors never carry meaning alone: add a shape or pattern.
9. Light and dark mode: use `@media (prefers-color-scheme: dark)` only if the class look needs it. The class looks are mostly one fixed world; check both.
10. No libraries. Plain DOM and SVG (or canvas). Keep the file under 500 lines.
11. `destroy()` removes all listeners, timers, and animation frames, and empties `root`.

## Class looks
Read `design/puzzle-app-design-checklist.md` Part B (shared flow layer) and Part C (class designs: Space, Quantity, Direction, Sequence). The home thumbnails in `design/home-preview.html` show the art style of each of the first four games. Match them.
