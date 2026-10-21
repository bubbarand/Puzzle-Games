// Tutorial steps for Pentomino 5x5 (spec 005). Data only: no DOM at import.
const board = ({ root }) => root.querySelector('[data-tut=board]');
const undoBtn = ({ gv }) => gv.querySelector('[data-a=undo]');

export const steps = [
  { ch: 'Goal', title: 'Fill the square', body: 'Fit every block into the 5 by 5 square.', target: board, lesson: true },
  { ch: 'Move', title: 'Place a block', body: 'Drag a block into the square.', target: ({ root }) => root.querySelector('.pe-pc.pe-tray'), hand: [0, -120], done: (S) => S.moves > 0 },
  { ch: 'Rules', title: 'Turn, never flip', body: 'Tap the wheel to turn the chosen block.', target: ({ root }) => root.querySelector('.pe-rot'), lesson: true },
  { ch: 'Undo', title: 'Take it back', body: 'Tap undo. A move is never final.', target: undoBtn, begin: (S) => S.undos, done: (S, u) => S.undos > u },
  { ch: 'Solve', title: 'Your turn', body: 'Fill the square to finish.', target: board, done: (S) => S.solved },
];
