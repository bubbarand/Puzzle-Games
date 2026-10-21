// Tutorial steps for Knapsack (spec 005). Data only: no DOM at import.
const item = (root, i) => root.querySelectorAll('.k-item')[i];
const read = (root, i) => root.querySelectorAll('.k-read')[i];
const undoBtn = ({ gv }) => gv.querySelector('[data-a=undo]');

export const steps = [
  { ch: 'Goal', title: 'Reach the value goal', body: 'Reach the value target. Stay under the weight limit.', target: ({ root }) => read(root, 1), lesson: true },
  { ch: 'Move', title: 'Pack an item', body: 'Tap an item to put it in the bag.', target: ({ root }) => item(root, 0), done: (S) => S.moves > 0 },
  { ch: 'Rules', title: 'Mind the weight', body: 'The bag has a weight limit. Heavy items are refused.', target: ({ root }) => read(root, 0), lesson: true },
  { ch: 'Undo', title: 'Take it back', body: 'Tap undo. A move is never final.', target: undoBtn, begin: (S) => S.undos, done: (S, u) => S.undos > u },
  { ch: 'Solve', title: 'Your turn', body: 'Reach the value target to finish.', target: ({ root }) => read(root, 1), done: (S) => S.solved },
];
