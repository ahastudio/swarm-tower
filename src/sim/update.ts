import { syncRotation } from '../camera/camera';
import game from '../game';
import { swapRemove } from '../mathHelpers';
import type { Seconds } from '../types';
import showGameOver from '../ui/showGameOver';
import attackWithWorker from './attackWithWorker';
import buildRing from './buildRing';
import buildSpots from './buildSpots';
import { updatePellets } from './coins';
import { updateShots } from './combat';
import moveEnemies from './moveEnemies';
import moveWorker from './moveWorker';
import { attackWithTowers } from './towers';
import updateWaves from './updateWaves';

const SPOT_PULSE_FADE = 4;
const EFFECT_SECONDS = 0.5;
const COIN_RING = 18;
// 날아든 동전이 판에 닿을 때 고리는 이미 이만큼 퍼져 있다
const COIN_RING_AGE = 0.25;

function tickBuildings(deltaSeconds: Seconds) {
  for (const spot of game.spots) {
    spot.born += deltaSeconds;
    spot.pulse = Math.max(0, spot.pulse - SPOT_PULSE_FADE * deltaSeconds);
  }
  game.houseBorn += deltaSeconds;
  game.towers.forEach((tower) => {
    tower.born += deltaSeconds;
  });
}

function landCoin(index: number) {
  const { spot } = game.flies[index];
  spot.pulse = 1;
  game.effects.push(buildRing(spot, COIN_RING, COIN_RING_AGE));
  swapRemove(game.flies, index);
}

function tickFlies(deltaSeconds: Seconds) {
  for (let index = game.flies.length - 1; index >= 0; index--) {
    game.flies[index].elapsed += deltaSeconds;
    if (game.flies[index].elapsed >= game.flies[index].duration) {
      landCoin(index);
    }
  }
}

function tickEffects(deltaSeconds: Seconds) {
  if (game.banner > 0) {
    game.banner -= deltaSeconds;
  }
  game.effects.forEach((effect) => {
    effect.age += deltaSeconds;
  });
  game.effects = game.effects.filter((effect) => effect.age < EFFECT_SECONDS);
}

function tickTimers(deltaSeconds: Seconds) {
  tickBuildings(deltaSeconds);
  tickFlies(deltaSeconds);
  tickEffects(deltaSeconds);
}

function moveWorld(deltaSeconds: Seconds) {
  game.time += deltaSeconds;
  syncRotation();
  moveWorker(deltaSeconds);
  updateWaves(deltaSeconds);
  moveEnemies(deltaSeconds);
}

function fightPhase(deltaSeconds: Seconds) {
  attackWithWorker(deltaSeconds);
  attackWithTowers(deltaSeconds);
  updateShots(deltaSeconds);
  updatePellets(deltaSeconds);
}

function settlePhase(deltaSeconds: Seconds) {
  buildSpots(deltaSeconds);
  tickTimers(deltaSeconds);
}

function actWorld(deltaSeconds: Seconds) {
  fightPhase(deltaSeconds);
  settlePhase(deltaSeconds);
}

function advanceFrame(deltaSeconds: Seconds) {
  moveWorld(deltaSeconds);
  if (game.hp <= 0) {
    showGameOver();
    return;
  }
  actWorld(deltaSeconds);
}

// 한 번 갱신한다. 순서는 이동, 웨이브, 적 이동, 게임 오버 확인, 공격, 탄, 동전, 판 짓기, 시간 값이다.
export default function update(deltaSeconds: Seconds) {
  if (!game.over) {
    advanceFrame(deltaSeconds);
  }
}
