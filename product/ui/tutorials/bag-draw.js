// Tutorial steps for Bag Draw (spec 005). Data only: no DOM at import. Limited tries, no undo.
const tile = (root, i) => root.querySelector(`.b-s[data-i="${i}"]`);

export const steps = [
  { ch: 'Goal', title: 'Reach the target sum', body: 'Fill the bag, then draw tiles. Reach the target.', target: ({ root }) => root.querySelector('.b-read'), lesson: true },
  { ch: 'Move', title: 'Put a tile in', body: 'Tap a tile to put it in the bag.', target: ({ root }) => tile(root, 5), done: (S) => S.moves > 0 },
  { ch: 'Rules', title: 'Fill the ring', body: 'Add tiles until the ring is full. Then tap draw.', target: ({ root }) => root.querySelector('.b-go'), lesson: true },
  { ch: 'Tries', title: 'Three draws only', body: 'Each draw uses one dot. There is no undo.', target: ({ gv }) => gv.querySelector('.hud .dots'), lesson: true },
  { ch: 'Solve', title: 'Your turn', body: 'Reach the target to finish.', target: ({ root }) => root.querySelector('.b-go'), done: (S) => S.solved },
];
