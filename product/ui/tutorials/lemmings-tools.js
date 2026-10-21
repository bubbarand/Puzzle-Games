// Tutorial steps for Lemmings Tools (spec 005). Data only: no DOM at import.
const undoBtn = ({ gv }) => gv.querySelector('[data-a=undo]');

export const steps = [
  { ch: 'Goal', title: 'Reach the exit', body: 'Walkers go right. Guide them to the exit.', target: ({ root }) => root.querySelector('.lt-stage'), lesson: true },
  { ch: 'Move', title: 'Place a tool', body: 'Pick a tool, then tap a dashed cell.', target: ({ root }) => root.querySelector('.lt-bar'), done: (S) => S.moves > 0 },
  { ch: 'Rules', title: 'Right tool, right cell', body: 'Dashed cells show where the chosen tool fits.', target: ({ root }) => root.querySelector('.lt-stage'), lesson: true },
  { ch: 'Undo', title: 'Take it back', body: 'Tap undo. A move is never final.', target: undoBtn, begin: (S) => S.undos, done: (S, u) => S.undos > u },
  { ch: 'Solve', title: 'Your turn', body: 'Place tools, then tap play.', target: ({ root }) => root.querySelector('.lt-go'), done: (S) => S.solved },
];
