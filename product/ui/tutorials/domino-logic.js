// Tutorial steps for Domino Logic (spec 005). Data only: no DOM at import.
const board = ({ root }) => root.querySelector('.dl-bd');

export const steps = [
  { ch: 'Goal', title: 'Finish the chain', body: 'The last domino has a gap. Fill it.', target: ({ root }) => root.querySelector('.dl-hole'), lesson: true },
  { ch: 'Read', title: 'Find the rule', body: 'All the dominoes follow one rule. Study them.', target: board, lesson: true },
  { ch: 'Pick', title: 'Pick the dots', body: 'Tap a number. A wrong one greys out.', target: ({ root }) => root.querySelector('.dl-pick'), done: (S) => S.solved },
];
