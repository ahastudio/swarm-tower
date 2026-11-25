import camera from '../camera/camera';
import { ENEMY_TIER } from '../enemyTiers';
import game from '../game';
import { spriteAssets } from '../sprites/assets';
import type { Enemy, Point } from '../types';
import { fillRect, type Rect, strokeEllipse } from './paint';
import type { RenderEnvironment } from './scene';

const ENEMY_MARGIN = 80;
const HOP_HEIGHT = 6;
const HOP_SPEED = 9;
const RING_RADIUS = 22;
const BAR_WIDTH = 36;
const BAR_HEIGHT = 5;
const ELITE_COLOR = '#ff4d4d';
const STRONG_COLOR = '#ffa53a';

const pickTierColor = (enemy: Enemy) =>
  enemy.tier === ENEMY_TIER.elite ? ELITE_COLOR : STRONG_COLOR;

function drawRing(environment: RenderEnvironment, point: Point, enemy: Enemy) {
  const { zoom } = environment;
  const radius = RING_RADIUS * enemy.scale;
  const pen = { color: pickTierColor(enemy), width: 3 * zoom };
  strokeEllipse(environment.context, pen, {
    x: point.x,
    y: point.y + 2 * zoom,
    radiusX: radius * zoom,
    radiusY: radius * camera.tilt * zoom,
  });
}

function calculateBarRect(
  environment: RenderEnvironment,
  point: Point,
  enemy: Enemy,
): Rect {
  const { zoom } = environment;
  const spriteStack = spriteAssets.enemies[enemy.spriteIndex];
  const width = BAR_WIDTH * enemy.scale * zoom;
  const height =
    spriteStack.layerCount *
    spriteStack.lift *
    (1 + (1 - camera.tilt)) *
    zoom *
    enemy.scale;
  return {
    x: point.x - width / 2,
    y: point.y - height - 8 * zoom,
    width,
    height: BAR_HEIGHT * zoom,
  };
}

function drawHealthBar(
  environment: RenderEnvironment,
  point: Point,
  enemy: Enemy,
) {
  const bar = calculateBarRect(environment, point, enemy);
  fillRect(environment.context, '#0008', bar);
  fillRect(environment.context, pickTierColor(enemy), {
    ...bar,
    width: (bar.width * enemy.hp) / enemy.maxHp,
  });
}

function drawBarIfHurt(
  environment: RenderEnvironment,
  point: Point,
  enemy: Enemy,
) {
  if (enemy.tier !== ENEMY_TIER.weak && enemy.hp < enemy.maxHp) {
    drawHealthBar(environment, point, enemy);
  }
}

function calculateHoppedFoot(
  environment: RenderEnvironment,
  foot: Point,
  enemy: Enemy,
): Point {
  const hop =
    Math.abs(Math.sin(game.time * HOP_SPEED + enemy.phase)) * HOP_HEIGHT;
  return { x: foot.x, y: foot.y - hop * environment.zoom };
}

function drawEnemy(environment: RenderEnvironment, foot: Point, enemy: Enemy) {
  const point = calculateHoppedFoot(environment, foot, enemy);
  if (enemy.tier !== ENEMY_TIER.weak) {
    drawRing(environment, point, enemy);
  }
  environment.stack(spriteAssets.enemies[enemy.spriteIndex], {
    angle: enemy.heading,
    x: point.x,
    y: point.y,
    scale: enemy.scale,
  });
  drawBarIfHurt(environment, point, enemy);
}

export default function addEnemies(environment: RenderEnvironment) {
  for (const enemy of game.enemies) {
    environment.place(enemy, ENEMY_MARGIN, (foot) =>
      drawEnemy(environment, foot, enemy),
    );
  }
}
