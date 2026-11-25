import createWorker from './sim/createWorker';
import type { GameState } from './types';

// 게임 상태. 모듈마다 이 객체 하나를 고쳐 쓴다.
const game: GameState = {
  worker: createWorker(),
  coins: 0,
  enemies: [],
  pellets: [],
  towers: [],
  spots: [],
  effects: [],
  shots: [],
  flies: [],
  time: 0,
  hp: 0,
  wave: 0,
  phase: 'break',
  phaseTime: 0,
  toSpawn: 0,
  spawnAccumulator: 0,
  banner: 0,
  bannerText: '',
  pulse: 0,
  houseBorn: 9,
  over: false,
};

export default game;
