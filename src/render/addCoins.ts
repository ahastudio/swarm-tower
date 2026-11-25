import camera from '../camera/camera';
import {
  COIN_BROWN_COLOR,
  COIN_GOLD_COLOR,
  COIN_HIGHLIGHT_COLOR,
} from '../constants';
import game from '../game';
import type { Pellet, Point } from '../types';
import {
  type Ellipse,
  fillEllipse,
  fillRect,
  strokeSegments,
  withScaleAbout,
} from './paint';
import type { RenderEnvironment } from './scene';

const COIN_MARGIN = 30;
const SPIN_SPEED = 6;
const BOB_SPEED = 3;
const GROW_SECONDS = 0.15;
const GLINT_SPEED = 4;
const GLINT_LEVEL = 0.96;
// 옆면이 보일 만큼 납작하지 않을 때만 앞면 무늬를 그린다
const FACE_VISIBLE = 0.3;

// 튀어 오르며 도는 동전의 타원. cosine은 도는 각도의 cos라서 가로 폭이 변한다
interface SpinningCoin extends Ellipse {
  cosine: number;
}

function createCoinEllipse(
  environment: RenderEnvironment,
  foot: Point,
  pellet: Pellet,
): SpinningCoin {
  const { zoom } = environment;
  const cosine = Math.cos(game.time * SPIN_SPEED + pellet.phase);
  const bob = Math.sin(game.time * BOB_SPEED + pellet.phase) * 2;
  const baseRadius = 13 * zoom;
  return {
    x: foot.x,
    y: foot.y - (16 + pellet.z + bob) * zoom,
    radiusX: Math.max(2.5 * zoom, Math.abs(cosine) * baseRadius),
    radiusY: baseRadius,
    cosine,
  };
}

function drawFace(context: CanvasRenderingContext2D, ellipse: Ellipse) {
  fillEllipse(context, COIN_HIGHLIGHT_COLOR, {
    ...ellipse,
    radiusX: ellipse.radiusX * 0.66,
    radiusY: ellipse.radiusY * 0.66,
  });
  const slot = {
    x: ellipse.x - ellipse.radiusX * 0.12,
    y: ellipse.y - ellipse.radiusY * 0.38,
    width: ellipse.radiusX * 0.24,
    height: ellipse.radiusY * 0.76,
  };
  fillRect(context, '#e7a62a', slot);
  const dot = {
    x: ellipse.x - ellipse.radiusX * 0.4,
    y: ellipse.y - ellipse.radiusY * 0.45,
    radiusX: ellipse.radiusX * 0.16,
    radiusY: ellipse.radiusY * 0.16,
  };
  fillEllipse(context, '#fffbe0', dot);
}

function drawGlint(environment: RenderEnvironment, ellipse: Ellipse) {
  const { zoom } = environment;
  const [x, top] = [ellipse.x + ellipse.radiusY, ellipse.y - ellipse.radiusY];
  strokeSegments(environment.context, { color: '#fff', width: 2 * zoom }, [
    [x, top - 8 * zoom, x, top + 6 * zoom],
    [x - 7 * zoom, top - 1 * zoom, x + 7 * zoom, top - 1 * zoom],
  ]);
}

// 앞면이 보이는 쪽의 반대로 옆면이 비껴 보인다
const calculateEdgeShift = (spinningCoin: SpinningCoin, zoom: number) =>
  (spinningCoin.cosine >= 0 ? -1 : 1) * 3 * zoom;

function drawCoinBody(
  environment: RenderEnvironment,
  spinningCoin: SpinningCoin,
) {
  const { context, zoom } = environment;
  const rim = 1.5 * zoom;
  fillEllipse(context, '#9a6414', {
    ...spinningCoin,
    x: spinningCoin.x + calculateEdgeShift(spinningCoin, zoom),
  });
  fillEllipse(context, COIN_BROWN_COLOR, {
    ...spinningCoin,
    radiusX: spinningCoin.radiusX + rim,
    radiusY: spinningCoin.radiusY + rim,
  });
  fillEllipse(context, COIN_GOLD_COLOR, spinningCoin);
}

function drawSpinning(
  environment: RenderEnvironment,
  pellet: Pellet,
  spinningCoin: SpinningCoin,
) {
  drawCoinBody(environment, spinningCoin);
  if (Math.abs(spinningCoin.cosine) > FACE_VISIBLE) {
    drawFace(environment.context, spinningCoin);
  }
  if (Math.sin(game.time * GLINT_SPEED + pellet.phase * 3) > GLINT_LEVEL) {
    drawGlint(environment, spinningCoin);
  }
}

function drawGroundShadow(
  environment: RenderEnvironment,
  foot: Point,
  grow: number,
) {
  const { zoom } = environment;
  fillEllipse(environment.context, 'rgba(50,70,40,.28)', {
    x: foot.x,
    y: foot.y,
    radiusX: 9 * zoom * grow,
    radiusY: 9 * camera.tilt * zoom * grow,
  });
}

function drawCoin(environment: RenderEnvironment, foot: Point, pellet: Pellet) {
  const grow = Math.min(1, pellet.age / GROW_SECONDS);
  const ellipse = createCoinEllipse(environment, foot, pellet);
  drawGroundShadow(environment, foot, grow);
  const about = { x: foot.x, y: ellipse.y, scale: grow };
  withScaleAbout(environment.context, about, () =>
    drawSpinning(environment, pellet, ellipse),
  );
}

export default function addCoins(environment: RenderEnvironment) {
  for (const pellet of game.pellets) {
    environment.place(pellet, COIN_MARGIN, (foot) =>
      drawCoin(environment, foot, pellet),
    );
  }
}
