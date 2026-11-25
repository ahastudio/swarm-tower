import { MAX_LEVEL, UPGRADE_COST, UPGRADE_PAD } from '../constants';
import game from '../game';
import { buildFlow } from '../world/flow';
import house from '../world/house';
import { createUpgradeSpot } from '../world/spots';
import { buildFencePieces, rebuildFences } from '../world/yard';
import buildRing from './buildRing';
import openGroup from './openGroup';
import showBanner from './showBanner';

const LEVEL_UP_RING = 120;

const isOpenGroupBuilt = () => {
  const open = game.spots.filter((spot) => !spot.isUpgrade);
  return open.length > 0 && open.every((spot) => spot.isBuilt);
};

const hasUpgradePad = () =>
  game.spots.some((spot) => spot.isUpgrade && !spot.isBuilt);

const canOfferUpgrade = () =>
  isOpenGroupBuilt() && !hasUpgradePad() && house.level < MAX_LEVEL;

export function syncUpPad() {
  if (canOfferUpgrade()) {
    game.spots.push(createUpgradeSpot(UPGRADE_PAD, UPGRADE_COST[house.level]));
  }
}

export function rebuildYard() {
  rebuildFences();
  buildFencePieces();
  buildFlow();
}

function raiseHouse() {
  house.level++;
  game.houseBorn = 0;
}

export function levelUp() {
  raiseHouse();
  rebuildYard();
  showBanner(`본부 레벨 ${house.level}`);
  openGroup(house.level - 1);
  game.effects.push(buildRing(house, LEVEL_UP_RING));
}
