// Tutorial steps for Breach Turns (spec 005). Data only: no DOM at import.
const undoBtn = ({ gv }) => gv.querySelector('[data-a=undo]');

export const steps = [
  { ch: 'Goal', title: 'Save the houses', body: 'Keep enough houses until the last turn ends.', target: ({ root }) => root.querySelector('.br-board'), lesson: true },
  { ch: 'Move', title: 'Move a unit', body: 'Tap your unit, then tap a lit cell.', target: ({ root }) => root.querySelector('.br-e.u'), done: (S) => S.moves > 0 },
  { ch: 'Rules', title: 'Red crosses strike', body: 'Enemies hit the marked cell when the turn ends.', target: ({ root }) => root.querySelector('.br-mk.t') || root.querySelector('.br-board'), lesson: true },
  { ch: 'Undo', title: 'Take it back', body: 'Tap undo. A move is never final.', target: undoBtn, begin: (S) => S.undos, done: (S, u) => S.undos > u },
  { ch: 'Solve', title: 'Your turn', body: 'Move every unit, then end the turn.', target: ({ root }) => root.querySelector('.br-end'), done: (S) => S.solved },
];
