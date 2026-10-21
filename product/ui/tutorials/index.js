// Registry of per-game tutorial steps. A game without an entry gets the default steps (tutorial.js).
// The lead adds one line here when a game's tutorial file is tested.
import { steps as trafficJam } from './traffic-jam.js';
import { steps as lightsOut } from './lights-out.js';
import { steps as golfTee } from './golf-tee.js';
import { steps as sokoban } from './sokoban.js';
import { steps as buildSquare } from './build-square.js';
import { steps as pentomino } from './pentomino-5x5.js';
import { steps as resourceAllocation } from './resource-allocation.js';
import { steps as balanceScale } from './balance-scale.js';
import { steps as knapsack } from './knapsack.js';
import { steps as bagDraw } from './bag-draw.js';
import { steps as monumentPath } from './monument-path.js';
import { steps as networkFlow } from './network-flow.js';
import { steps as shapeSudoku } from './shape-sudoku.js';
import { steps as mirrorLaser } from './mirror-laser.js';
import { steps as towerFall } from './tower-fall.js';
import { steps as matrixReasoning } from './matrix-reasoning.js';
import { steps as dominoLogic } from './domino-logic.js';
import { steps as hanoi } from './hanoi.js';
import { steps as lemmingsTools } from './lemmings-tools.js';
import { steps as breachTurns } from './breach-turns.js';

export const tutorials = { hanoi, 'lemmings-tools': lemmingsTools, 'breach-turns': breachTurns, 'tower-fall': towerFall, 'matrix-reasoning': matrixReasoning, 'domino-logic': dominoLogic, 'shape-sudoku': shapeSudoku, 'mirror-laser': mirrorLaser, 'monument-path': monumentPath, 'network-flow': networkFlow, knapsack, 'bag-draw': bagDraw, 'resource-allocation': resourceAllocation, 'balance-scale': balanceScale, 'traffic-jam': trafficJam, 'lights-out': lightsOut, 'golf-tee': golfTee, sokoban, 'build-square': buildSquare, 'pentomino-5x5': pentomino };
