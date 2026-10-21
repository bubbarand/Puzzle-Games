// Tutorial steps for Lights Out (spec 005). Data only: no DOM at import.
const cell = (root, i) => root.querySelectorAll('.lo-cell')[i];
const undoBtn = ({ gv }) => gv.querySelector('[data-a=undo]');

export const steps = [
  { ch: 'Goal', title: 'Lights off', body: 'Turn every bulb off.', target: ({ root }) => root.querySelector('.lo-board'), lesson: true },
  { ch: 'Move', title: 'Tap a bulb', body: 'Tap this bulb.', target: ({ root }) => cell(root, 12), done: (S) => S.moves > 0 },
  { ch: 'Rules', title: 'Neighbors flip', body: 'The bulb and its four neighbors flip.', target: ({ root }) => root.querySelector('.lo-board'), lesson: true },
  { ch: 'Undo', title: 'Take it back', body: 'Tap undo to flip them back.', target: undoBtn, begin: (S) => S.undos, done: (S, u) => S.undos > u },
  { ch: 'Solve', title: 'Your turn', body: 'Turn off every bulb to finish.', target: ({ root }) => root.querySelector('.lo-board'), done: (S) => S.solved },
];
