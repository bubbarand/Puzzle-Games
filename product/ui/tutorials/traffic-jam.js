// Tutorial steps for Traffic Jam (spec 005). Data only: no DOM at import.
const car = (root, i) => root.querySelectorAll('.tj-car')[i];
const undoBtn = ({ gv }) => gv.querySelector('[data-a=undo]');

export const steps = [
  { ch: 'Goal', title: 'Free the red car', body: 'Drive the red car out of the right side.', target: ({ root }) => car(root, 0), lesson: true },
  { ch: 'Move', title: 'Slide a car', body: 'Drag this car along its road.', target: ({ root }) => car(root, 5), hand: [70, 0], done: (S) => S.moves > 0 },
  { ch: 'Rules', title: 'Cars cannot pass', body: 'A car stops at the next car. Clear the red car’s road.', target: ({ root }) => car(root, 1), lesson: true },
  { ch: 'Undo', title: 'Take it back', body: 'Tap undo. A move is never final.', target: undoBtn, begin: (S) => S.undos, done: (S, u) => S.undos > u },
  { ch: 'Solve', title: 'Your turn', body: 'Free the red car to finish.', target: ({ root }) => car(root, 0), done: (S) => S.solved },
];
