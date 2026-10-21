// Tutorial steps for Network Flow (spec 005). Data only: no DOM at import.
const undoBtn = ({ gv }) => gv.querySelector('[data-a=undo]');
const valve = ({ root }) => root.querySelector('[data-e]');

export const steps = [
  { ch: 'Goal', title: 'Fill the boxes', body: 'Send water from the sun to the boxes.', target: ({ root }) => root.querySelector('svg.nf-s'), lesson: true },
  { ch: 'Move', title: 'Open a valve', body: 'Tap this valve to add one unit.', target: valve, done: (S) => S.moves > 0 },
  { ch: 'Rules', title: 'Plus and minus', body: 'Plus adds water. Minus takes it away.', target: ({ root }) => root.querySelector('.nf-row'), lesson: true },
  { ch: 'Undo', title: 'Take it back', body: 'Tap undo to remove that unit.', target: undoBtn, begin: (S) => S.undos, done: (S, u) => S.undos > u },
  { ch: 'Solve', title: 'Your turn', body: 'Match every box number to finish.', target: ({ root }) => root.querySelector('svg.nf-s'), done: (S) => S.solved },
];
