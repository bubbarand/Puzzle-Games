// RULE CHOICE: pieces may rotate but not flip; "square" levels also include a pyramid outline; a move places or removes one piece; fixed pieces never move.
import { makePoly } from './poly.js';

const sq = (n) => Array.from({ length: n }, () => Array(n).fill(1));

const pyr = (rows) => Array.from({ length: rows }, (_, r) => Array.from({ length: 2 * rows - 1 }, (_, c) => (c >= rows - 1 - r && c <= rows - 1 + r ? 1 : 0)));

const g = makePoly({ id: 'build-square', title: 'Build the Square', cls: 'space' }, [
  { board: sq(4), tiling: [[[0,0],[1,0],[2,0]],[[0,1],[0,2],[0,3]],[[1,1],[1,2],[1,3],[2,2]],[[2,1],[3,0],[3,1]],[[2,3],[3,2],[3,3]]], fixed: [2] },
  { board: sq(5), tiling: [[[0,0],[1,0],[1,1],[1,2]],[[0,1],[0,2],[0,3],[1,3]],[[0,4],[1,4],[2,4],[3,4]],[[2,0],[2,1],[2,2],[2,3],[3,0]],[[3,1],[3,2],[3,3],[4,3],[4,4]],[[4,0],[4,1],[4,2]]], fixed: [1] },
  { board: pyr(5), tiling: [[[0,4],[1,4],[2,4],[3,3],[3,4]],[[1,3],[2,2],[2,3]],[[1,5],[2,5],[2,6]],[[3,1],[3,2],[4,0],[4,1]],[[3,5],[3,6],[3,7],[4,5]],[[4,2],[4,3],[4,4]],[[4,6],[4,7],[4,8]]], fixed: [5] },
  { board: sq(6), tiling: [[[0,0],[0,1],[1,1],[1,2]],[[0,2],[0,3],[1,3],[1,4],[2,4]],[[0,4],[0,5],[1,5],[2,5],[3,5]],[[1,0],[2,0],[3,0],[3,1],[4,1]],[[2,1],[2,2],[2,3],[3,3]],[[3,2],[4,2],[4,3],[5,2]],[[3,4],[4,4],[4,5]],[[4,0],[5,0],[5,1]],[[5,3],[5,4],[5,5]]], fixed: [5] },
  { board: sq(6), tiling: [[[0,0],[1,0],[1,1],[1,2],[2,2]],[[0,1],[0,2],[0,3],[0,4],[0,5]],[[1,3],[1,4],[2,3],[3,2],[3,3]],[[1,5],[2,4],[2,5],[3,4]],[[2,0],[2,1],[3,1],[4,1]],[[3,0],[4,0],[5,0]],[[3,5],[4,3],[4,4],[4,5]],[[4,2],[5,1],[5,2]],[[5,3],[5,4],[5,5]]], fixed: [] },
]);

export const { meta, makeLevel, initialState, legalMoves, applyMove, isSolved, bestScore, score, maxTries } = g;
