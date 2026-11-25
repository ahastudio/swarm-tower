import { CAMERA_START, HOUSE_X, HOUSE_Y } from '../constants';
import type { Camera, Point } from '../types';

// 처음 카메라는 본부에서 오른쪽으로 이만큼 떨어진 곳을 본다
const START_OFFSET_X = 200;

const camera: Camera = {
  x: HOUSE_X + START_OFFSET_X,
  y: HOUSE_Y,
  zoom: 1,
  rotation: 0,
  tilt: 1,
  panX: 0,
  panY: 0,
  rotationCos: 1,
  rotationSin: 0,
};

export default camera;

export function syncRotation() {
  camera.rotationCos = Math.cos(camera.rotation);
  camera.rotationSin = Math.sin(camera.rotation);
}

export function resetCamera(target: Point) {
  const { rotation: startRotation } = CAMERA_START;
  const centered = { x: target.x, y: target.y, panX: 0, panY: 0 };
  Object.assign(camera, CAMERA_START, centered, {
    rotationCos: Math.cos(startRotation),
    rotationSin: Math.sin(startRotation),
  });
}
