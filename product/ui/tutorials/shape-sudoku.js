// Tutorial steps for Shape Sudoku (spec 005). Data only: no DOM at import.
const grid = ({ root }) => root.querySelector('.s-grid');
const undoBtn = ({ gv }) => gv.querySelector('[data-a=undo]');

export const steps = [
  { ch: 'Goal', title: 'Fill the grid', body: 'Each shape once in every row and column.', target: grid, lesson: true },
  { ch: 'Move', title: 'Place a shape', body: 'Tap a shape, then tap an empty tile.', target: ({ root }) => (root.querySelector('.s-tr.on') ? grid({ root }) : root.querySelector('.s-tray')), done: (S) => S.moves > 0 },
  { ch: 'Rules', title: 'No repeats', body: 'A repeat in a row or column is refused.', target: grid, lesson: true },
  { ch: 'Undo', title: 'Take it back', body: 'Tap undo to remove the shape.', target: undoBtn, begin: (S) => S.undos, done: (S, u) => S.undos > u },
  { ch: 'Solve', title: 'Your turn', body: 'Fill every tile to finish.', target: grid, done: (S) => S.solved },
];
