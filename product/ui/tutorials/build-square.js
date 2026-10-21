// Tutorial steps for Build the Square (spec 005). Data only: no DOM at import.
const board = ({ root }) => root.querySelector('[data-tut=board]');
const undoBtn = ({ gv }) => gv.querySelector('[data-a=undo]');

export const steps = [
  { ch: 'Goal', title: 'Fill the outline', body: 'Fit every block into the shape.', target: board, lesson: true },
  { ch: 'Move', title: 'Place a block', body: 'Drag a block into the outline.', target: ({ root }) => root.querySelector('.bs-pc.bs-tray'), hand: [0, -120], done: (S) => S.moves > 0 },
  { ch: 'Rules', title: 'Locked blocks stay', body: 'A locked block cannot move. Fit the others around it.', target: ({ root }) => root.querySelector('.bs-pc.bs-fix'), lesson: true },
  { ch: 'Undo', title: 'Take it back', body: 'Tap undo. A move is never final.', target: undoBtn, begin: (S) => S.undos, done: (S, u) => S.undos > u },
  { ch: 'Solve', title: 'Your turn', body: 'Fill the outline to finish.', target: board, done: (S) => S.solved },
];
