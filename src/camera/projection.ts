import { ISLAND_ELEVATION } from '../constants';
import { spriteAssets } from '../sprites/assets';
import type { Point } from '../types';
import { getHeightAt } from '../world/terrainQueries';
import camera from './camera';
import view from './view';

// 화면 좌표를 돌려받는 임시 점. 매 프레임 새 객체를 만들지 않으려고 돌려 쓴다
export const scratchFirst: Point = { x: 0, y: 0 };
export const scratchSecond: Point = { x: 0, y: 0 };

// 섬 위의 모든 것은 바다보다 ISLAND_ELEVATION만큼 위에 있다. 카메라를 낮추면 높이도 더 크게 보인다
export const calculateLift = (height = ISLAND_ELEVATION) =>
  height * camera.zoom * (1 + (1 - camera.tilt));

// 카메라 중심은 주인공의 발이 아니라 머리다. 발 위치를 화면 중심보다 키 높이만큼 아래로 내린다
export const calculateHeadLift = () =>
  spriteAssets.manIdle
    ? spriteAssets.manIdle.layerCount *
      spriteAssets.manIdle.lift *
      (1 + (1 - camera.tilt)) *
      camera.zoom
    : 0;

// 월드 -> 화면. 평행 투영만 쓴다: flat은 월드 좌표의 아핀 변환(회전, 줌, 위아래 누르기)이고, 물체의 높이는 y만 위로 올린다.
// 먼 곳과 가까운 곳의 배율이 다를 수 없다(배율은 줌 하나뿐). projection.test.ts가 여러 카메라 상태에서 이를 테스트한다.
export function projectFlat(x: number, y: number, out: Point) {
  const deltaX = x - camera.x - camera.panX;
  const deltaY = y - camera.y - camera.panY;
  out.x =
    view.width / 2 +
    (deltaX * camera.rotationCos - deltaY * camera.rotationSin) * camera.zoom;
  out.y =
    view.height / 2 +
    (deltaX * camera.rotationSin + deltaY * camera.rotationCos) *
      camera.zoom *
      camera.tilt +
    calculateHeadLift();
  return out;
}

export function project(x: number, y: number, out: Point) {
  projectFlat(x, y, out);
  out.y -= calculateLift() + calculateLift(getHeightAt(x, y));
  return out;
}

// 화면 -> 월드
export function unproject(x: number, y: number, out: Point) {
  const unscaledX = (x - view.width / 2) / camera.zoom;
  const unscaledY =
    (y + calculateLift() - calculateHeadLift() - view.height / 2) /
    (camera.zoom * camera.tilt);
  out.x =
    unscaledX * camera.rotationCos +
    unscaledY * camera.rotationSin +
    camera.x +
    camera.panX;
  out.y =
    -unscaledX * camera.rotationSin +
    unscaledY * camera.rotationCos +
    camera.y +
    camera.panY;
  return out;
}
