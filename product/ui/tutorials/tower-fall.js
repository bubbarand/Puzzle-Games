// Tutorial steps for Tower Fall (spec 005). Data only: no DOM at import.
const undoBtn = ({ gv }) => gv.querySelector('[data-a=undo]');

export const steps = [
  { ch: 'Goal', title: 'Stop the jellies', body: 'Green jellies walk the road. Keep them from the gate.', target: ({ root }) => root.querySelector('.tf-s'), lesson: true },
  { ch: 'Move', title: 'Place a tower', body: 'Tap a dotted spot to build a tower.', target: ({ root }) => root.querySelector('.tf-sl'), done: (S) => S.moves > 0 },
  { ch: 'Rules', title: 'Tower range', body: 'A tower hits jellies one cell away. Each shot takes one point.', target: ({ root }) => root.querySelector('.tf-rng'), lesson: true },
  { ch: 'Undo', title: 'Take it back', body: 'Tap undo to remove the tower.', target: undoBtn, begin: (S) => S.undos, done: (S, u) => S.undos > u },
  { ch: 'Solve', title: 'Your turn', body: 'Place your towers, then tap play.', target: ({ root }) => root.querySelector('.tf-bar'), done: (S) => S.solved },
];
