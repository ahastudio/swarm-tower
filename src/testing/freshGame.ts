import { resetCamera } from '../camera/camera';
import view from '../camera/view';
import game from '../game';
import { randomState } from '../randomNumbers';
import resetGame from '../resetGame';
import { buildFlow } from '../world/flow';
import house from '../world/house';
import { buildFencePieces, rebuildFences } from '../world/yard';

// 새 게임 상태로 되돌린다. 열린 타워 판은 모두 지워 테스트가 필요한 것만 놓는다
export function prepareFreshGame() {
  resetGame();
  game.spots = [];
  game.houseBorn = 9;
  game.over = false;
  game.pulse = 0;
  game.banner = 0;
  randomState.seed = 7;
  Object.assign(view, { width: 1000, height: 600, pixelRatio: 1 });
  resetCamera({ x: 2200, y: 1670 });
}

// 본부 레벨을 1로 되돌리고 마당과 적의 길을 다시 만든다
export function resetHouse() {
  house.level = 1;
  rebuildFences();
  buildFencePieces();
  buildFlow();
}
