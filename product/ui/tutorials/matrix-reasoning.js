// Tutorial steps for Matrix Reasoning (spec 005). Data only: no DOM at import.
const board = ({ root }) => root.querySelector('.mx-bd');

export const steps = [
  { ch: 'Goal', title: 'Fill the gap', body: 'One square is missing. Find the one that fits.', target: board, lesson: true },
  { ch: 'Read', title: 'Read the pattern', body: 'Compare squares across each row and down each column.', target: board, lesson: true },
  { ch: 'Pick', title: 'Pick the square', body: 'Tap your answer. A wrong pick greys out.', target: ({ root }) => root.querySelector('.mx-tray'), done: (S) => S.solved },
];
