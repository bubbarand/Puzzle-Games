// Tutorial steps for Golf Tee (spec 005). Data only: no DOM at import.
const board = ({ root }) => root.querySelector('.gt-main');
const undoBtn = ({ gv }) => gv.querySelector('[data-a=undo]');

export const steps = [
  { ch: 'Goal', title: 'Leave one tee', body: 'Jump tees away until one is left.', target: board, lesson: true },
  { ch: 'Move', title: 'Jump a tee', body: 'Tap this tee, then tap the glowing hole.', target: ({ root }) => root.querySelectorAll('.gt-peg')[2], done: (S) => S.moves > 0 },
  { ch: 'Rules', title: 'Jump over a tee', body: 'Jump over a neighbor into an empty hole.', target: board, lesson: true },
  { ch: 'Undo', title: 'Take it back', body: 'Tap undo. A jump is never final.', target: undoBtn, begin: (S) => S.undos, done: (S, u) => S.undos > u },
  { ch: 'Solve', title: 'Your turn', body: 'Leave one tee to finish.', target: board, done: (S) => S.solved },
];
