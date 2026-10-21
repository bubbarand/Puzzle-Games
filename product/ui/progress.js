// Daily progression (spec 004). Pure functions: no DOM, no storage, no clock, no fixed game list.
// The shell passes the order list (ids, earning order) and today's date string 'YYYY-MM-DD'.
//
// Decisions where the spec is open:
// 1. A type earned on day D can be played from day D+1. State adds `availableFrom: { [id]: day }`.
//    Until then the type is in `owned` but shows as `locked`, and it does not count for "all solved".
// 2. `reconcile` walks every day from `lastDay` (inclusive) up to today (exclusive). `lastDay` is the
//    last day the app was opened, so it is also a day the player could have missed. A day counts as
//    earned only if `earnedOn === thatDay`.
// 3. `earnedOn` is set on the day the player finishes all playable types, even when the queue is
//    empty (then only the streak changes). So "earnedOn" really means "completed day".
// 4. A miss with a freeze keeps the streak and sets `frozenDay` to the missed day. A miss without a
//    freeze removes the newest owned type (never below MIN_OWNED) and sets the streak to 0.
export const MIN_OWNED = 4;
const MS_DAY = 86400000;
const toMs = (d) => Date.parse(d + 'T00:00:00Z');
const fmt = (ms) => new Date(ms).toISOString().slice(0, 10);
const addDays = (d, n) => fmt(toMs(d) + n * MS_DAY);

export const initState = (order) => ({
  owned: order.slice(0, MIN_OWNED), queue: order.slice(MIN_OWNED), streak: 0, freezes: 0,
  lastDay: null, solved: {}, availableFrom: {}, earnedOn: null, frozenDay: null,
});

export function reconcile(state, today) {
  if (!state.lastDay) return { ...state, lastDay: today };
  let s = { ...state, owned: [...state.owned], queue: [...state.queue], solved: { ...state.solved }, availableFrom: { ...state.availableFrom } };
  for (let d = s.lastDay; d < today; d = addDays(d, 1)) {
    if (s.earnedOn === d) continue;
    if (s.freezes > 0) { s.freezes -= 1; s.frozenDay = d; continue; }
    if (s.owned.length > MIN_OWNED) {
      const id = s.owned.pop();
      s.queue.unshift(id); delete s.solved[id]; delete s.availableFrom[id];
    }
    s.streak = 0;
  }
  s.lastDay = today;
  return s;
}

export function onSolved(state, id, today) {
  if (!state.owned.includes(id)) return state;
  const s = { ...state, owned: [...state.owned], queue: [...state.queue], solved: { ...state.solved, [id]: today }, availableFrom: { ...state.availableFrom } };
  const playable = s.owned.filter((o) => !(s.availableFrom[o] > today));
  if (!playable.every((o) => s.solved[o] === today) || s.earnedOn === today) return s;
  s.earnedOn = today;
  s.streak += 1;
  if (s.queue.length) {
    const next = s.queue.shift();
    s.owned.push(next);
    s.availableFrom[next] = addDays(today, 1);
  }
  if (s.streak >= 7) { s.freezes += 1; s.streak = 0; }
  return s;
}

export function rowState(state, id, today, order) {
  if (!order.includes(id) || !state.owned.includes(id) || state.availableFrom[id] > today) return 'locked';
  if (state.solved[id] === today) return 'done';
  return state.frozenDay === addDays(today, -1) ? 'frozen' : 'available';
}
