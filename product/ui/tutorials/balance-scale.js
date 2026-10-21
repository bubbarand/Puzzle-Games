// Tutorial steps for Balance Scale (spec 005). Data only: no DOM at import. Weights stay hidden: the steps teach how to weigh, not the answer.
const add = (root, i) => root.querySelectorAll('.b-add')[i];
const undoBtn = ({ gv }) => gv.querySelector('[data-a=undo]');

export const steps = [
  { ch: 'Goal', title: 'Balance the pans', body: 'Make the right pan weigh the same as the left.', target: ({ root }) => root.querySelector('.b-stage'), lesson: true },
  { ch: 'Move', title: 'Load a shape', body: 'Tap a shape to put it on the right pan.', target: ({ root }) => add(root, 0), done: (S) => S.moves > 0 },
  { ch: 'Weigh', title: 'Compare shapes', body: 'The beam tips to the heavier pan. Add another shape.', target: ({ root }) => add(root, 1), begin: (S) => S.moves, done: (S, m) => S.moves > m },
  { ch: 'Rules', title: 'Stock is limited', body: 'Dots show shapes left. Tap minus to take one back.', target: ({ root }) => root.querySelector('.b-tray'), lesson: true },
  { ch: 'Undo', title: 'Take it back', body: 'Tap undo. A move is never final.', target: undoBtn, begin: (S) => S.undos, done: (S, u) => S.undos > u },
  { ch: 'Solve', title: 'Your turn', body: 'Balance the pans to finish.', target: ({ root }) => root.querySelector('.b-tray'), done: (S) => S.solved },
];
