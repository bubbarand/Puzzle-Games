# Spec 004: Daily progression (earn, remove, freeze)

Status: draft, written from Isaac's rules (HANDOFF.md items 1-2). Pure logic in `product/ui/progress.js` (no DOM, no storage), tested with `node --test`. The shell only calls it.

## Words
- **Day:** the local calendar date, string `YYYY-MM-DD`.
- **Owned types:** the games the player can play today. Start: the first 4 in ORDER (traffic-jam, knapsack, mirror-laser, lights-out).
- **Day set:** one puzzle per owned type, the type's current level (the shell already stores `level`).
- **Done today:** the player solved the current level of EVERY owned type on that day.

## State (one JSON object, key `puzzle-app-progress-v1`)
```
{ owned: [id], queue: [id], streak: n, freezes: n, lastDay: 'YYYY-MM-DD',
  solved: { [id]: 'YYYY-MM-DD' },   // last day each type was solved
  earnedOn: 'YYYY-MM-DD' | null,    // day the last new type was earned
  frozenDay: 'YYYY-MM-DD' | null }  // day a freeze was used for (shown iced)
```
`queue` = types not owned, in earning order (ORDER minus owned). A removed type goes to the FRONT of the queue (so it is earned back first). There is no "choose a new type" screen yet.

## Rules
1. **Earn.** When the last owned type is solved on a day, and `earnedOn !== today`: add `queue[0]` to `owned` (it is playable from the NEXT day: store `availableFrom`), `streak += 1`, `earnedOn = today`. If the queue is empty, only the streak changes.
2. **Freeze.** When `streak` reaches 7: `freezes += 1`, `streak = 0`. Freezes stack (no cap).
3. **Miss.** On open, for each whole day between `lastDay` and today (exclusive of today) on which the player did NOT earn: if `freezes > 0` then `freezes -= 1`, `frozenDay` = that day (the streak is kept); else remove the most recently earned type (last item of `owned`, never below 4 owned) to the FRONT of `queue`, and `streak = 0`. A missed day with no earning is any day where `earnedOn` is not that day.
4. **Idempotent.** Opening the app twice on one day changes nothing.
5. **Row states** (home list): `locked` (in queue), `done` (solved today), `frozen` (owned, not solved today, and `frozenDay` is yesterday: iced, still playable), `available` (owned, not solved today). Order: available, frozen, done, locked.
6. **Test switch.** URL hash `#all` (works in the artifact viewer) shows every game as available and does not change progress. `localStorage` failures fall back to in-memory state.

## API (`product/ui/progress.js`)
- `initState()` returns the start state.
- `reconcile(state, today)` returns a new state after applying rule 3 (pure).
- `onSolved(state, id, today)` returns a new state after rule 1 and 2 (pure). Called by the shell on every solve.
- `rowState(state, id, today, order)` returns `locked | done | frozen | available`.
- Tests: first open; solve all 4 earns type 5 for tomorrow; miss without freeze removes the newest type; 7 earning days gives a freeze; a freeze absorbs a miss; two opens in a day are idempotent; removed type is re-earned first; never fewer than 4 owned.
