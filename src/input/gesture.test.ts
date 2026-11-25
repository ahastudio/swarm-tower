import { beforeEach, describe, expect, it } from 'vitest';
import camera from '../camera/camera';
import game from '../game';
import { prepareFreshGame } from '../testing/freshGame';
import { moveGesture, startGesture } from './gesture';
import pointerState from './pointerState';

// 두 손가락을 (x1, y1), (x2, y2)에 놓는다
const placeFingers = (
  endX: number,
  endY: number,
  thirdX: number,
  thirdY: number,
) => {
  pointerState.touches.clear();
  pointerState.touches.set(1, { x: endX, y: endY });
  pointerState.touches.set(2, { x: thirdX, y: thirdY });
};

beforeEach(() => {
  prepareFreshGame();
  Object.assign(camera, { zoom: 1, rotation: 0, tilt: 0.8 });
  placeFingers(400, 300, 600, 300);
});

describe('startGesture', () => {
  it('이동 목표를 주인공 자리로 지우고 아직 모르는 상태로 시작한다', () => {
    Object.assign(game.worker, { x: 10, y: 20, targetX: 99, targetY: 99 });
    startGesture();
    expect([game.worker.targetX, game.worker.targetY]).toEqual([10, 20]);
    expect(pointerState.mode).toBe('gesture');
    expect(pointerState.gesture).toMatchObject({
      kind: 'pending',
      startDistance: 200,
      startMiddleY: 300,
      distance: 200,
      middleY: 300,
    });
  });

  it('손가락 사이 거리가 0이면 1로 본다', () => {
    placeFingers(100, 100, 100, 100);
    startGesture();
    expect(pointerState.gesture.startDistance).toBe(1);
  });
});

describe('moveGesture', () => {
  beforeEach(startGesture);

  it('12px 미만으로 움직이면 아직 정하지 않고 아무것도 바꾸지 않는다', () => {
    placeFingers(405, 300, 605, 300);
    moveGesture();
    expect(pointerState.gesture.kind).toBe('pending');
    expect(camera.zoom).toBe(1);
    expect(pointerState.gesture.distance).toBe(200);
  });

  it('손가락 사이가 가장 크게 바뀌면 줌과 회전 조작이 된다', () => {
    placeFingers(350, 300, 650, 300);
    moveGesture();
    expect(pointerState.gesture.kind).toBe('view');
    expect(camera.zoom).toBeCloseTo(1.5);
    expect(camera.rotation).toBeCloseTo(0);
    expect(pointerState.gesture.distance).toBe(300);
  });

  it('줌은 0.35에서 3 사이로 맞춘다', () => {
    placeFingers(0, 300, 1000, 300);
    moveGesture();
    expect(camera.zoom).toBe(3);
    placeFingers(499, 300, 501, 300);
    moveGesture();
    expect(camera.zoom).toBeCloseTo(0.35);
  });

  it('손가락을 비틀면 그만큼 카메라가 돈다', () => {
    placeFingers(400, 250, 600, 350);
    moveGesture();
    expect(pointerState.gesture.kind).toBe('view');
    expect(camera.rotation).toBeCloseTo(Math.atan2(100, 200));
  });

  it('함께 위아래로 밀면 높낮이 조작이 되어 tilt가 바뀐다', () => {
    placeFingers(400, 340, 600, 340);
    moveGesture();
    expect(pointerState.gesture.kind).toBe('tilt');
    expect(camera.tilt).toBeCloseTo(0.8 + 40 * 0.003);
  });

  it('높낮이는 0.35에서 1 사이로 맞춘다', () => {
    placeFingers(400, 340, 600, 340);
    moveGesture();
    placeFingers(400, 1000, 600, 1000);
    moveGesture();
    expect(camera.tilt).toBe(1);
    placeFingers(400, -3000, 600, -3000);
    moveGesture();
    expect(camera.tilt).toBe(0.35);
  });

  it('정한 뒤에는 이전 프레임과의 차이만 적용한다', () => {
    placeFingers(350, 300, 650, 300);
    moveGesture();
    placeFingers(350, 300, 650, 300);
    moveGesture();
    expect(camera.zoom).toBeCloseTo(1.5);
  });
});
