import { project, scratchFirst } from '../camera/projection';
import {
  COIN_BROWN_COLOR,
  COIN_GOLD_COLOR,
  COIN_HIGHLIGHT_COLOR,
} from '../constants';
import game from '../game';
import type { Effect, Fly, Point, Shot } from '../types';
import { fillCircle, fillEllipse, strokeCircle } from './paint';
import type { RenderEnvironment } from './scene';

const EFFECT_SECONDS = 0.5;
const FLY_SPIN = 14;
const FLY_ARC = 70;
const FLY_SHADOW = 'rgba(50,70,40,.25)';
const SHOT_SHADOW = 'rgba(50,70,40,.3)';
// 탄이 땅 위로 떠 있는 기본 높이
const SHOT_LIFT = 30;

function projectInterpolated(from: Point, to: Point, progress: number) {
  const x = from.x + (to.x - from.x) * progress;
  return project(x, from.y + (to.y - from.y) * progress, scratchFirst);
}

// 돌면서 날아드는 동전: 가로 폭이 변하는 타원, 갈색 테두리, 안쪽 밝은 원
function calculateFlyCoinSize(zoom: number, fly: Fly) {
  const baseRadius = 12 * zoom;
  const spin = Math.abs(Math.cos(game.time * FLY_SPIN + fly.phase));
  return {
    radiusX: Math.max(3 * zoom, spin * baseRadius),
    radiusY: baseRadius,
    rim: 1.5 * zoom,
  };
}

function drawFlyCoin(environment: RenderEnvironment, center: Point, fly: Fly) {
  const { context } = environment;
  const { radiusX, radiusY, rim } = calculateFlyCoinSize(environment.zoom, fly);
  fillEllipse(context, COIN_BROWN_COLOR, {
    ...center,
    radiusX: radiusX + rim,
    radiusY: radiusY + rim,
  });
  fillEllipse(context, COIN_GOLD_COLOR, { ...center, radiusX, radiusY });
  fillEllipse(context, COIN_HIGHLIGHT_COLOR, {
    ...center,
    radiusX: radiusX * 0.6,
    radiusY: radiusY * 0.6,
  });
}

const calculateFlyHeight = (environment: RenderEnvironment, progress: number) =>
  (30 * (1 - progress) +
    6 * progress +
    Math.sin(progress * Math.PI) * FLY_ARC) *
  environment.zoom;

function drawFlyShadow(environment: RenderEnvironment, point: Point) {
  const { zoom } = environment;
  fillEllipse(environment.context, FLY_SHADOW, {
    x: point.x,
    y: point.y,
    radiusX: 8 * zoom,
    radiusY: 3 * zoom,
  });
}

function drawFly(environment: RenderEnvironment, fly: Fly) {
  const progress = fly.elapsed / fly.duration;
  const point = projectInterpolated(fly, fly.spot, progress);
  drawFlyShadow(environment, point);
  drawFlyCoin(
    environment,
    { x: point.x, y: point.y - calculateFlyHeight(environment, progress) },
    fly,
  );
}

// 작은 탄은 낮게, 큰 탄은 높게 날고 색이 다르다
const SHOT_STYLES = [
  { arc: 60, radius: 8, shine: 3, color: '#ffd23f', shineColor: '#fff6c2' },
  { arc: 110, radius: 11, shine: 4, color: '#3b3350', shineColor: '#7a6fa0' },
];

type ShotStyle = (typeof SHOT_STYLES)[number];

const pickShotStyle = (shot: Shot) => SHOT_STYLES[Number(shot.isBig)];

function calculateBallCenter(
  environment: RenderEnvironment,
  point: Point,
  shot: Shot,
): Point {
  const { zoom } = environment;
  const progress = shot.elapsed / shot.duration;
  const rise = Math.sin(progress * Math.PI) * pickShotStyle(shot).arc * zoom;
  return { x: point.x, y: point.y - SHOT_LIFT * zoom - rise };
}

function drawShotShadow(environment: RenderEnvironment, point: Point) {
  const { zoom } = environment;
  fillEllipse(environment.context, SHOT_SHADOW, {
    x: point.x,
    y: point.y,
    radiusX: 7 * zoom,
    radiusY: 3 * zoom,
  });
}

function drawShotBall(
  environment: RenderEnvironment,
  center: Point,
  style: ShotStyle,
) {
  const { context, zoom } = environment;
  fillCircle(context, style.color, { ...center, radius: style.radius * zoom });
  const shine = {
    x: center.x - 3 * zoom,
    y: center.y - 3 * zoom,
    radius: style.shine * zoom,
  };
  fillCircle(context, style.shineColor, shine);
}

function drawShot(environment: RenderEnvironment, shot: Shot) {
  const progress = shot.elapsed / shot.duration;
  const point = projectInterpolated(
    shot,
    { x: shot.targetX, y: shot.targetY },
    progress,
  );
  drawShotShadow(environment, point);
  drawShotBall(
    environment,
    calculateBallCenter(environment, point, shot),
    pickShotStyle(shot),
  );
}

// 연출 하나를 그리는 데 쓰는 값: 화면 위치, 연출, 진행 비율(0~1)
interface EffectFrame {
  point: Point;
  effect: Effect;
  age: number;
}

function strokeRing(environment: RenderEnvironment, frame: EffectFrame) {
  const { zoom } = environment;
  const pen = { color: `rgba(255,255,255,${1 - frame.age})`, width: 5 * zoom };
  const ringRadius = frame.effect.radius * (0.3 + frame.age) * zoom;
  strokeCircle(environment.context, pen, {
    x: frame.point.x,
    y: frame.point.y,
    radius: ringRadius,
  });
}

const createBurstColors = (age: number) => [
  `rgba(255,240,215,${0.85 * (1 - age)})`,
  `rgba(255,190,90,${0.7 * (1 - age)})`,
];

function fillBurst(environment: RenderEnvironment, frame: EffectFrame) {
  const { context, zoom } = environment;
  const { point: at, effect, age } = frame;
  const [outer, inner] = createBurstColors(age);
  fillCircle(context, outer, {
    x: at.x,
    y: at.y,
    radius: effect.radius * (0.5 + age * 0.7) * zoom,
  });
  fillCircle(context, inner, {
    x: at.x,
    y: at.y,
    radius: effect.radius * 0.4 * (1 + age) * zoom,
  });
}

function drawEffect(environment: RenderEnvironment, effect: Effect) {
  const frame = {
    point: project(effect.x, effect.y, scratchFirst),
    effect,
    age: effect.age / EFFECT_SECONDS,
  };
  if (effect.isBuildEffect) {
    strokeRing(environment, frame);
    return;
  }
  fillBurst(environment, frame);
}

export default function drawEffects(environment: RenderEnvironment) {
  for (const fly of game.flies) {
    if (fly.elapsed >= 0) {
      drawFly(environment, fly);
    }
  }
  game.shots.forEach((shot) => {
    drawShot(environment, shot);
  });
  game.effects.forEach((effect) => {
    drawEffect(environment, effect);
  });
}
