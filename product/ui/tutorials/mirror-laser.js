// Tutorial steps for Mirror Laser (spec 005). Data only: no DOM at import. Limited tries, no undo: the tries dots are a lesson.
const board = ({ root }) => root.querySelector('svg.ml-s');

export const steps = [
  { ch: 'Goal', title: 'Reach the target', body: 'Bounce the beam through every glowing tile.', target: board, lesson: true },
  { ch: 'Move', title: 'Place a mirror', body: 'Tap a floor tile to place a mirror.', target: board, done: (S) => S.moves > 0 },
  { ch: 'Rules', title: 'Turn a mirror', body: 'Tap again to turn it. Tap once more to clear.', target: board, lesson: true },
  { ch: 'Tries', title: 'Tries are limited', body: 'Each shot uses one dot. There is no undo.', target: ({ gv }) => gv.querySelector('.hud .dots'), lesson: true },
  { ch: 'Solve', title: 'Your turn', body: 'Place mirrors, then tap fire.', target: ({ root }) => root, done: (S) => S.solved },
];
