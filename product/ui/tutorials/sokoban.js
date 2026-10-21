// Tutorial steps for Sokoban (spec 005). Data only: no DOM at import.
const board = ({ root }) => root.querySelector('.sk-main');
const undoBtn = ({ gv }) => gv.querySelector('[data-a=undo]');

export const steps = [
  { ch: 'Goal', title: 'Fill the spots', body: 'Push every crate onto a marked spot.', target: board, lesson: true },
  { ch: 'Move', title: 'Walk around', body: 'Use the arrows to take a step.', target: ({ root }) => root.querySelector('.sk-pad'), done: (S) => S.moves > 0 },
  { ch: 'Rules', title: 'Push, never pull', body: 'You push one crate. Walls and crates stop it.', target: board, lesson: true },
  { ch: 'Undo', title: 'Take it back', body: 'Tap undo. A step is never final.', target: undoBtn, begin: (S) => S.undos, done: (S, u) => S.undos > u },
  { ch: 'Solve', title: 'Your turn', body: 'Fill every spot to finish.', target: ({ root }) => root.querySelector('.sk-pad'), done: (S) => S.solved },
];
