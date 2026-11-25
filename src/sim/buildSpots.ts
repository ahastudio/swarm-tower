import { SPOT_HALF, TOWER_MAX_LEVEL, TOWER_UPGRADE_COST } from '../constants';
import game from '../game';
import { nextRandom } from '../randomNumbers';
import type { Seconds, Spot, Tower } from '../types';
import house from '../world/house';
import buildRing from './buildRing';
import { levelUp, syncUpPad } from './headquarters';
import { createTower, powerUp } from './towers';

// 동전은 초당 이만큼씩 판으로 날아간다
const COINS_PER_SECOND = 40;
const MAX_FLIES = 50;
const FLY_STAGGER = 0.02;
const FLY_SECONDS = 0.34;
const BUILD_RING = 50;

function launchCoin(spot: Spot) {
  if (game.flies.length < MAX_FLIES) {
    game.flies.push({
      x: game.worker.x,
      y: game.worker.y,
      spot,
      elapsed: -game.flies.length * FLY_STAGGER,
      duration: FLY_SECONDS,
      phase: nextRandom() * 6,
    });
  }
}

const canTakeCoin = (spot: Spot) => spot.coinCharge >= 1 && game.coins > 0;

function takeCoin(spot: Spot) {
  spot.coinCharge--;
  game.coins--;
  launchCoin(spot);
}

function feedSpot(spot: Spot) {
  while (canTakeCoin(spot) && spot.paid < spot.cost) {
    takeCoin(spot);
    spot.paid++;
  }
}

function payBuild(spot: Spot, deltaSeconds: Seconds) {
  spot.coinCharge += deltaSeconds * COINS_PER_SECOND;
  feedSpot(spot);
  if (spot.paid >= spot.cost) {
    completeBuild(spot);
  }
}

function feedTower(spot: Spot, tower: Tower, cost: number) {
  while (canTakeCoin(spot) && tower.powerUpPaid < cost) {
    takeCoin(spot);
    tower.powerUpPaid++;
  }
}

function payPowerUp(spot: Spot, tower: Tower, deltaSeconds: Seconds) {
  const cost = TOWER_UPGRADE_COST[tower.level - 1];
  spot.coinCharge += deltaSeconds * COINS_PER_SECOND;
  feedTower(spot, tower, cost);
  if (tower.powerUpPaid >= cost) {
    powerUp(tower);
  }
}

function upgradeHouse() {
  levelUp();
  game.spots = game.spots.filter((spot) => !spot.isUpgrade);
  syncUpPad();
}

function buildTower(spot: Spot) {
  syncUpPad();
  const tower = createTower(spot.x, spot.y);
  game.towers.push(tower);
  spot.tower = tower;
  game.effects.push(buildRing(spot, BUILD_RING));
}

function completeBuild(spot: Spot) {
  spot.isBuilt = true;
  if (spot.isUpgrade) {
    upgradeHouse();
    return;
  }
  buildTower(spot);
}

// 타워 레벨은 본부 레벨을 넘지 못한다
const canPowerUp = (tower: Tower) =>
  tower.level < Math.min(TOWER_MAX_LEVEL, house.level);

function payBuiltSpot(spot: Spot, tower: Tower, deltaSeconds: Seconds) {
  if (canPowerUp(tower)) {
    payPowerUp(spot, tower, deltaSeconds);
  }
}

function paySpot(spot: Spot, deltaSeconds: Seconds) {
  if (spot.tower) {
    payBuiltSpot(spot, spot.tower, deltaSeconds);
    return;
  }
  payBuild(spot, deltaSeconds);
}

const isOnPad = (spot: Spot) =>
  Math.abs(game.worker.x - spot.x) < SPOT_HALF &&
  Math.abs(game.worker.y - spot.y) < SPOT_HALF;

function isPayable(spot: Spot) {
  if (spot.isBuilt && !spot.tower) {
    return false;
  }
  if (game.coins <= 0) {
    return false;
  }
  return isOnPad(spot);
}

export default function buildSpots(deltaSeconds: Seconds) {
  for (const spot of game.spots) {
    if (isPayable(spot)) {
      paySpot(spot, deltaSeconds);
    }
  }
}
