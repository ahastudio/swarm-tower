import camera from '../camera/camera';
import { calculateLift } from '../camera/projection';
import view from '../camera/view';
import { GROUND_SCALE } from './getGroundLayers';

// 바닥을 그리는 변환: 이미지(월드 좌표 1단위가 1px)를 카메라 회전, 줌, 높낮이에 맞춰 화면에 놓는다
interface GroundTransform {
  scale: number;
  x: number;
  y: number;
}

export interface WorldOrigin {
  x: number;
  y: number;
}

function applyTransform(
  context: CanvasRenderingContext2D,
  groundTransform: GroundTransform,
) {
  const { pixelRatio } = view;
  const pixelScale = pixelRatio * camera.zoom;
  context.setTransform(
    pixelScale * camera.rotationCos * groundTransform.scale,
    pixelScale * camera.rotationSin * camera.tilt * groundTransform.scale,
    -pixelScale * camera.rotationSin * groundTransform.scale,
    pixelScale * camera.rotationCos * camera.tilt * groundTransform.scale,
    pixelRatio * groundTransform.x,
    pixelRatio * groundTransform.y,
  );
}

export function setWorldTransform(
  context: CanvasRenderingContext2D,
  origin: WorldOrigin,
  height: number,
) {
  applyTransform(context, {
    scale: 1,
    x: origin.x,
    y: origin.y - calculateLift(height),
  });
}

// 미리 그려 둔 반 해상도 그림을 놓는다. 그림의 왼쪽 위가 (x, y)에 온다
export function setLayerTransform(
  context: CanvasRenderingContext2D,
  corner: WorldOrigin,
  offset: number,
) {
  applyTransform(context, {
    scale: 1 / GROUND_SCALE,
    x: corner.x,
    y: corner.y + offset,
  });
}
