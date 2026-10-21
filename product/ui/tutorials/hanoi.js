// Tutorial steps for Hanoi (spec 005). Data only: no DOM at import.
const peg = (root, i) => root.querySelectorAll('.hn-peg')[i];
const undoBtn = ({ gv }) => gv.querySelector('[data-a=undo]');

export const steps = [
  { ch: 'Goal', title: 'Move the tower', body: 'Move every disc to the last peg.', target: ({ root }) => [...root.querySelectorAll('.hn-peg')].pop(), lesson: true },
  { ch: 'Move', title: 'Move one disc', body: 'Tap this peg, then tap another peg.', target: ({ root }) => peg(root, 0), done: (S) => S.moves > 0 },
  { ch: 'Rules', title: 'Big never on small', body: 'A disc cannot sit on a smaller disc.', target: ({ root }) => root.querySelector('.hn-board'), lesson: true },
  { ch: 'Undo', title: 'Take it back', body: 'Tap undo. A move is never final.', target: undoBtn, begin: (S) => S.undos, done: (S, u) => S.undos > u },
  { ch: 'Solve', title: 'Your turn', body: 'Move all discs to the last peg.', target: ({ root }) => root.querySelector('.hn-board'), done: (S) => S.solved },
];
