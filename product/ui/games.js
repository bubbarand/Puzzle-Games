// Registry of games that have a playable UI. Add a line here when a game's UI module lands.
import * as trafficJamUi from './traffic-jam.js';
import * as trafficJamLogic from '../logic/traffic-jam.js';
import * as knapsackUi from './knapsack.js';
import * as knapsackLogic from '../logic/knapsack.js';
import * as lightsOutUi from './lights-out.js';
import * as lightsOutLogic from '../logic/lights-out.js';
import * as mirrorLaserUi from './mirror-laser.js';
import * as mirrorLaserLogic from '../logic/mirror-laser.js';
import * as golfTeeUi from './golf-tee.js';
import * as golfTeeLogic from '../logic/golf-tee.js';
import * as sokobanUi from './sokoban.js';
import * as sokobanLogic from '../logic/sokoban.js';
import * as bagDrawUi from './bag-draw.js';
import * as bagDrawLogic from '../logic/bag-draw.js';
import * as resourceAllocationUi from './resource-allocation.js';
import * as resourceAllocationLogic from '../logic/resource-allocation.js';
import * as buildSquareUi from './build-square.js';
import * as buildSquareLogic from '../logic/build-square.js';
import * as pentomino5x5Ui from './pentomino-5x5.js';
import * as pentomino5x5Logic from '../logic/pentomino-5x5.js';
import * as balanceScaleUi from './balance-scale.js';
import * as balanceScaleLogic from '../logic/balance-scale.js';
import * as shapeSudokuUi from './shape-sudoku.js';
import * as shapeSudokuLogic from '../logic/shape-sudoku.js';
import * as monumentPathUi from './monument-path.js';
import * as monumentPathLogic from '../logic/monument-path.js';
import * as networkFlowUi from './network-flow.js';
import * as networkFlowLogic from '../logic/network-flow.js';
import * as lemmingsToolsUi from './lemmings-tools.js';
import * as lemmingsToolsLogic from '../logic/lemmings-tools.js';
import * as towerFallUi from './tower-fall.js';
import * as towerFallLogic from '../logic/tower-fall.js';
import * as matrixReasoningUi from './matrix-reasoning.js';
import * as matrixReasoningLogic from '../logic/matrix-reasoning.js';
import * as dominoLogicUi from './domino-logic.js';
import * as dominoLogicLogic from '../logic/domino-logic.js';
import * as breachTurnsUi from './breach-turns.js';
import * as breachTurnsLogic from '../logic/breach-turns.js';
import * as hanoiUi from './hanoi.js';
import * as hanoiLogic from '../logic/hanoi.js';

export const games = {
  'traffic-jam': { ui: trafficJamUi, logic: trafficJamLogic },
  'knapsack': { ui: knapsackUi, logic: knapsackLogic },
  'mirror-laser': { ui: mirrorLaserUi, logic: mirrorLaserLogic },
  'lights-out': { ui: lightsOutUi, logic: lightsOutLogic },
  'golf-tee': { ui: golfTeeUi, logic: golfTeeLogic },
  'sokoban': { ui: sokobanUi, logic: sokobanLogic },
  'bag-draw': { ui: bagDrawUi, logic: bagDrawLogic },
  'resource-allocation': { ui: resourceAllocationUi, logic: resourceAllocationLogic },
  'build-square': { ui: buildSquareUi, logic: buildSquareLogic },
  'pentomino-5x5': { ui: pentomino5x5Ui, logic: pentomino5x5Logic },
  'balance-scale': { ui: balanceScaleUi, logic: balanceScaleLogic },
  'shape-sudoku': { ui: shapeSudokuUi, logic: shapeSudokuLogic },
  'monument-path': { ui: monumentPathUi, logic: monumentPathLogic },
  'network-flow': { ui: networkFlowUi, logic: networkFlowLogic },
  'lemmings-tools': { ui: lemmingsToolsUi, logic: lemmingsToolsLogic },
  'tower-fall': { ui: towerFallUi, logic: towerFallLogic },
  'matrix-reasoning': { ui: matrixReasoningUi, logic: matrixReasoningLogic },
  'domino-logic': { ui: dominoLogicUi, logic: dominoLogicLogic },
  'breach-turns': { ui: breachTurnsUi, logic: breachTurnsLogic },
  'hanoi': { ui: hanoiUi, logic: hanoiLogic },
};
