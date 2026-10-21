// Tutorial steps for Resource Allocation (spec 005). Data only: no DOM at import.
const undoBtn = ({ gv }) => gv.querySelector('[data-a=undo]');

export const steps = [
  { ch: 'Goal', title: 'Fill the tubes', body: 'Place all 10 coins. Reach the target return.', target: ({ root }) => root.querySelector('.r-read'), lesson: true },
  { ch: 'Move', title: 'Tap a tube', body: 'Tap a tube. A higher tap puts in more coins.', target: ({ root }) => root.querySelectorAll('.r-tube')[1], done: (S) => S.moves > 0 },
  { ch: 'Rules', title: 'Only 10 coins', body: 'Extra coins are refused. Dots show coins left.', target: ({ root }) => root.querySelector('.r-pool'), lesson: true },
  { ch: 'Rules', title: 'Beat the red line', body: 'Every year must reach the red dashed line.', target: ({ root }) => root.querySelector('[data-tut=years]'), lesson: true },
  { ch: 'Undo', title: 'Take it back', body: 'Tap undo. A move is never final.', target: undoBtn, begin: (S) => S.undos, done: (S, u) => S.undos > u },
  { ch: 'Solve', title: 'Your turn', body: 'Place all coins to finish.', target: ({ root }) => root, done: (S) => S.solved },
];
