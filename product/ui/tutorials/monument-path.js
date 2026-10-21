// Tutorial steps for Monument Path (spec 005). Data only: no DOM at import.
const undoBtn = ({ gv }) => gv.querySelector('[data-a=undo]');

export const steps = [
  { ch: 'Goal', title: 'Reach the lantern', body: 'Walk the traveler to the glowing lantern.', target: ({ root }) => root.querySelector('.mp-beam'), lesson: true },
  { ch: 'Turn', title: 'Turn the world', body: 'Tap a turn button. Look from a new side.', target: ({ root }) => root.querySelector('.mp-row'), done: (S) => S.moves > 0 },
  { ch: 'Walk', title: 'Walk a step', body: 'Tap a glowing step to walk there.', target: ({ root }) => root.querySelector('.mp-ring.on')?.parentNode, begin: (S) => S.moves, done: (S, m) => S.moves > m },
  { ch: 'Rules', title: 'Looks joined, is joined', body: 'Blocks that touch on screen can be walked.', target: ({ root }) => root.querySelector('svg.mp-s'), lesson: true },
  { ch: 'Undo', title: 'Take it back', body: 'Tap undo to go back one move.', target: undoBtn, begin: (S) => S.undos, done: (S, u) => S.undos > u },
  { ch: 'Solve', title: 'Your turn', body: 'Reach the lantern to finish.', target: ({ root }) => root.querySelector('svg.mp-s'), done: (S) => S.solved },
];
