import camera from '../camera/camera';
import {
  HINT_BLUE_COLOR,
  LABEL_CREAM_COLOR,
  LABEL_YELLOW_COLOR,
  OUTLINE_COLOR,
  TOWER_MAX_LEVEL,
  TOWER_UPGRADE_COST,
  UPGRADE_BLUE_COLOR,
} from '../constants';
import game from '../game';
import { spriteAssets } from '../sprites/assets';
import type { Point, Tower } from '../types';
import house from '../world/house';
import drawOutlinedText from './drawOutlinedText';
import {
  type Circle,
  drawCoinIcon,
  fillCircle,
  fillRect,
  strokeCircle,
} from './paint';
import type { RenderEnvironment } from './scene';

const TOWER_MARGIN = 150;
const HINT_RANGE = 170;
const POP_SECONDS = 0.6;
const STACK_SHRINK = 0.9;
const RECOIL_DROP = 3;
const DOT_SPACING = 14;
const DOT_RADIUS = 5;
const BAR_WIDTH = 70;

// 한 타워를 그리는 데 쓰는 위치: 화면 발 위치, 받침과 대포를 합친 높이 위쪽, 타워
interface TowerDraw {
  foot: Point;
  top: number;
  tower: Tower;
}

function calculatePopScale(tower: Tower) {
  const progress = Math.min(1, tower.born / POP_SECONDS);
  const eased =
    1 + 2.70158 * (progress - 1) ** 3 + 1.70158 * (progress - 1) ** 2;
  return Math.max(0.05, eased) * (1 + 0.06 * (tower.level - 1));
}

const calculateSquash = () => 1 + (1 - camera.tilt);

const calculateBaseHeight = (environment: RenderEnvironment, scale: number) =>
  spriteAssets.base.layerCount *
  spriteAssets.base.lift *
  environment.zoom *
  calculateSquash() *
  STACK_SHRINK *
  scale;

const calculateRecoilDrop = (environment: RenderEnvironment, tower: Tower) =>
  tower.recoil > 0 ? RECOIL_DROP * environment.zoom : 0;

function drawBody(environment: RenderEnvironment, foot: Point, tower: Tower) {
  const scale = calculatePopScale(tower);
  environment.shadow(foot, 34 * Math.min(1, scale));
  environment.stack(spriteAssets.base, {
    angle: 0,
    x: foot.x,
    y: foot.y,
    scale,
  });
  const cannonY =
    foot.y -
    calculateBaseHeight(environment, scale) +
    calculateRecoilDrop(environment, tower);
  environment.stack(spriteAssets.cannon, {
    angle: tower.heading,
    x: foot.x,
    y: cannonY,
    scale,
  });
}

function calculateTop(environment: RenderEnvironment, foot: Point) {
  const layers =
    spriteAssets.base.layerCount * spriteAssets.base.lift +
    spriteAssets.cannon.layerCount * spriteAssets.cannon.lift;
  return (
    foot.y -
    layers * environment.zoom * calculateSquash() * STACK_SHRINK -
    14 * environment.zoom
  );
}

function createDot(
  environment: RenderEnvironment,
  towerDraw: TowerDraw,
  index: number,
): Circle {
  const x =
    towerDraw.foot.x +
    (index - (towerDraw.tower.level - 2) / 2) * DOT_SPACING * environment.zoom;
  return { x, y: towerDraw.top, radius: DOT_RADIUS * environment.zoom };
}

function drawDot(environment: RenderEnvironment, dot: Circle) {
  fillCircle(environment.context, LABEL_YELLOW_COLOR, dot);
  strokeCircle(
    environment.context,
    { color: OUTLINE_COLOR, width: 2 * environment.zoom },
    dot,
  );
}

function drawLevelDots(environment: RenderEnvironment, towerDraw: TowerDraw) {
  for (let index = 0; index < towerDraw.tower.level - 1; index++) {
    drawDot(environment, createDot(environment, towerDraw, index));
  }
}

const isNear = (tower: Tower) =>
  Math.hypot(game.worker.x - tower.x, game.worker.y - tower.y) < HINT_RANGE;

function drawNeedHouse(environment: RenderEnvironment, towerDraw: TowerDraw) {
  const { zoom } = environment;
  drawOutlinedText(
    environment.context,
    `본부 레벨 ${towerDraw.tower.level + 1} 필요`,
    {
      x: towerDraw.foot.x,
      y: towerDraw.top - 22 * zoom,
      font: `bold ${16 * zoom}px sans-serif`,
      lineWidth: 5 * zoom,
      stroke: LABEL_CREAM_COLOR,
      fill: '#6b6b6b',
    },
  );
}

// 파워업 안내가 놓이는 곳(anchor)과 드는 동전, 낸 동전
interface CostHint {
  anchor: Point;
  cost: number;
  paid: number;
}

function drawCostBar(environment: RenderEnvironment, hint: CostHint) {
  const { context, zoom } = environment;
  const width = BAR_WIDTH * zoom;
  const bar = {
    x: hint.anchor.x - width / 2,
    y: hint.anchor.y + 12 * zoom,
    width,
    height: 6 * zoom,
  };
  fillRect(context, '#0009', bar);
  fillRect(context, UPGRADE_BLUE_COLOR, {
    ...bar,
    width: (width * hint.paid) / hint.cost,
  });
}

function drawCostLabel(environment: RenderEnvironment, hint: CostHint) {
  const { context, zoom } = environment;
  const { anchor } = hint;
  drawOutlinedText(context, `▲ ${hint.cost - hint.paid}`, {
    x: anchor.x - 8 * zoom,
    y: anchor.y,
    font: `bold ${18 * zoom}px sans-serif`,
    lineWidth: 5 * zoom,
    stroke: LABEL_CREAM_COLOR,
    fill: HINT_BLUE_COLOR,
  });
  drawCoinIcon(
    context,
    { x: anchor.x + 28 * zoom, y: anchor.y + 1 * zoom, radius: 8 * zoom },
    2 * zoom,
  );
}

function drawUpgradeCost(environment: RenderEnvironment, towerDraw: TowerDraw) {
  const anchor = {
    x: towerDraw.foot.x,
    y: towerDraw.top - 22 * environment.zoom,
  };
  const hint = {
    anchor,
    cost: TOWER_UPGRADE_COST[towerDraw.tower.level - 1],
    paid: towerDraw.tower.powerUpPaid,
  };
  drawCostBar(environment, hint);
  drawCostLabel(environment, hint);
}

const needsHouseLevel = (tower: Tower) =>
  tower.level < TOWER_MAX_LEVEL && tower.level >= house.level;

const canPowerUp = (tower: Tower) =>
  tower.level < Math.min(TOWER_MAX_LEVEL, house.level);

function drawHints(environment: RenderEnvironment, towerDraw: TowerDraw) {
  if (needsHouseLevel(towerDraw.tower) && isNear(towerDraw.tower)) {
    drawNeedHouse(environment, towerDraw);
  }
  if (canPowerUp(towerDraw.tower) && isNear(towerDraw.tower)) {
    drawUpgradeCost(environment, towerDraw);
  }
}

function drawTower(environment: RenderEnvironment, foot: Point, tower: Tower) {
  const drawing = { foot, top: calculateTop(environment, foot), tower };
  drawBody(environment, foot, tower);
  if (tower.level > 1) {
    drawLevelDots(environment, drawing);
  }
  drawHints(environment, drawing);
}

export default function addTowers(environment: RenderEnvironment) {
  for (const tower of game.towers) {
    environment.place(tower, TOWER_MARGIN, (foot) =>
      drawTower(environment, foot, tower),
    );
  }
}
