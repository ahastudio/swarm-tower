import { project, scratchFirst } from '../camera/projection';
import view from '../camera/view';
import { LABEL_YELLOW_COLOR, OUTLINE_COLOR } from '../constants';
import game from '../game';
import type { Enemy, Point } from '../types';
import drawOutlinedText from './drawOutlinedText';
import { fillPolygon, withRotation, withTransform } from './paint';
import type { RenderEnvironment } from './scene';

const DIRECTIONS = 12;
const TURN = Math.PI * 2;
const ENEMY_STRIDE = 3;
const EDGE_X = 50;
const EDGE_Y = 60;
const TINY = 1e-6;
const BANNER_FADE = 0.6;
const BANNER_POP_START = 2.1;
const BANNER_POP_SECONDS = 0.3;
const BANNER_POP_SCALE = 0.5;
const ARROW = [
  { x: 24, y: 0 },
  { x: -14, y: -20 },
  { x: -14, y: 20 },
];

// 화면 밖 적이 있는 방향 하나와 그쪽 적의 수
interface Arrow {
  bin: number;
  count: number;
}

function findDirectionBin(point: Point) {
  const angle = Math.atan2(point.y - view.height / 2, point.x - view.width / 2);
  const turns = ((angle / TURN) * DIRECTIONS) % DIRECTIONS;
  return ((turns + DIRECTIONS + 0.5) | 0) % DIRECTIONS;
}

function countOffscreen(
  environment: RenderEnvironment,
  enemy: Enemy,
  bins: number[],
) {
  project(enemy.x, enemy.y, scratchFirst);
  if (!environment.isVisible(scratchFirst, 0)) {
    bins[findDirectionBin(scratchFirst)]++;
  }
}

function offscreenBins(environment: RenderEnvironment) {
  const bins = new Array(DIRECTIONS).fill(0);
  for (let index = 0; index < game.enemies.length; index += ENEMY_STRIDE) {
    countOffscreen(environment, game.enemies[index], bins);
  }
  return bins;
}

function findEdgePoint(angle: number): Point {
  const [cosine, sine] = [Math.cos(angle), Math.sin(angle)];
  const reaches = [
    [view.width / 2 - EDGE_X, cosine],
    [view.height / 2 - EDGE_Y, sine],
  ].map(([limit, direction]) => limit / Math.abs(direction || TINY));
  const nearest = Math.min(...reaches);
  return {
    x: view.width / 2 + cosine * nearest,
    y: view.height / 2 + sine * nearest,
  };
}

// 적이 많을수록 진하고, 시간에 따라 깜박인다
const calculateArrowAlpha = (arrow: Arrow) =>
  Math.min(1, 0.4 + arrow.count / 20) * (0.6 + 0.4 * Math.sin(game.time * 6));

function drawArrow(environment: RenderEnvironment, arrow: Arrow) {
  const { context } = environment;
  const angle = (arrow.bin / DIRECTIONS) * TURN;
  const alpha = calculateArrowAlpha(arrow);
  const pose = { ...findEdgePoint(angle), angle };
  withRotation(context, pose, () =>
    fillPolygon(context, `rgba(255,80,80,${alpha})`, ARROW),
  );
}

function paintBanner(context: CanvasRenderingContext2D, fade: number) {
  context.globalAlpha = fade;
  drawOutlinedText(context, game.bannerText, {
    x: 0,
    y: 0,
    font: 'bold 88px sans-serif',
    lineWidth: 14,
    stroke: OUTLINE_COLOR,
    fill: LABEL_YELLOW_COLOR,
  });
}

function drawBanner(environment: RenderEnvironment) {
  const fade = Math.min(1, game.banner / BANNER_FADE);
  const pop = Math.max(
    0,
    (game.banner - BANNER_POP_START) / BANNER_POP_SECONDS,
  );
  const scale = 1 + pop * BANNER_POP_SCALE;
  const point = { x: view.width / 2, y: view.height * 0.3, scale };
  withTransform(environment.context, point, () =>
    paintBanner(environment.context, fade),
  );
}

export default function drawOverlay(environment: RenderEnvironment) {
  offscreenBins(environment).forEach((count, bin) => {
    if (count > 0) {
      drawArrow(environment, { bin, count });
    }
  });
  if (game.banner > 0) {
    drawBanner(environment);
  }
}
