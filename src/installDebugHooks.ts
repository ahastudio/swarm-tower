import camera from './camera/camera';
import { project } from './camera/projection';
import game from './game';
import draw from './render/draw';
import propList from './render/propList';
import isMoveBlocked from './sim/isMoveBlocked';
import update from './sim/update';
import { spriteAssets } from './sprites/assets';
import { budget } from './sprites/drawSprite';
import type { Point, Segment } from './types';
import house from './world/house';
import { canStand, getHeightAt, getLevelAt } from './world/terrainQueries';
import { fencePieces, YARD } from './world/yard';

declare global {
  interface Window {
    __game?: object;
  }
}

const FENCE_PREVIEW = 5;
const MEASURED_FRAME_STEP = 1 / 60;
const SIMULATION_STEP = 0.05;

function simulate(frames: number) {
  for (let index = 0; index < frames; index++) {
    update(SIMULATION_STEP);
  }
}

// frames번 갱신하고 그리는 데 한 프레임당 걸린 시간(ms)
function measureFrameTime(frames: number) {
  const start = performance.now();
  for (let index = 0; index < frames; index++) {
    update(MEASURED_FRAME_STEP);
    draw();
  }
  return (performance.now() - start) / frames;
}

function projectToScreen(x: number, y: number) {
  const out: Point = { x: 0, y: 0 };
  project(x, y, out);
  return out;
}

const takeSnapshot = () => ({
  coins: game.coins,
  towers: game.towers.length,
  enemies: game.enemies.length,
  hp: game.hp,
  wave: game.wave,
  phase: game.phase,
  zoom: camera.zoom,
  rotation: camera.rotation,
});

const createReaders = () => ({
  budgetCount: () => budget.count,
  worker: () => game.worker,
  fencePreview: () => fencePieces.slice(0, FENCE_PREVIEW),
  towers: () => game.towers,
  spots: () => game.spots,
  enemies: () => game.enemies,
  pellets: () => game.pellets,
  project: projectToScreen,
});

const actions = {
  damage: (amount: number) => {
    game.hp -= amount;
  },
  give: (amount: number) => (game.coins += amount),
  skip: () => {
    game.phaseTime = 0;
  },
  simulate,
  measureFrameTime,
};

// 지름 radius인 몸이 (x, y)에 설 수 있는지
const canStandAt = (...query: [number, number, number]) =>
  canStand({ x: query[0], y: query[1] }, query[2]);

// 주인공이 이 한 걸음을 못 걷는지
const isBlocked = (...move: Segment) =>
  isMoveBlocked({ x: move[0], y: move[1] }, { x: move[2], y: move[3] });

// 브라우저 콘솔의 window.__game: 개발 중 상태를 읽고 테스트하는 디버그 훅. 제품 화면에는 보이지 않는다.
export default function installDebugHooks() {
  window.__game = {
    ...createReaders(),
    ...actions,
    isBlocked,
    heightAt: getHeightAt,
    levelAt: getLevelAt,
    canStand: canStandAt,
    props: propList,
    house,
    camera,
    spriteAssets,
    yard: YARD,
    get state() {
      return takeSnapshot();
    },
  };
}
