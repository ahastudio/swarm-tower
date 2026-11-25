import { resetCamera } from './camera/camera';
import { HOUSE_MAX_HP } from './constants';
import game from './game';
import createWorker from './sim/createWorker';
import { rebuildYard } from './sim/headquarters';
import openGroup from './sim/openGroup';
import house from './world/house';

const START_BREAK = 5;

// 새 게임을 시작하는 상태. houseBorn, pulse, bannerText는 이어 간다
const createFreshState = () => ({
  worker: createWorker(),
  coins: 0,
  enemies: [],
  pellets: [],
  effects: [],
  towers: [],
  shots: [],
  flies: [],
  spots: [],
  time: 0,
  hp: HOUSE_MAX_HP,
  wave: 0,
  banner: 0,
  phase: 'break' as const,
  phaseTime: START_BREAK,
  toSpawn: 0,
  spawnAccumulator: 0,
});

export default function resetGame() {
  Object.assign(game, createFreshState());
  house.level = 1;
  rebuildYard();
  openGroup(0);
  resetCamera(game.worker);
}
