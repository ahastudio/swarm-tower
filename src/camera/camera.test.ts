import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CAMERA_START, HOUSE_X, HOUSE_Y } from '../constants';
import camera, { resetCamera, syncRotation } from './camera';

beforeEach(() => {
  Object.assign(camera, {
    x: 1,
    y: 2,
    zoom: 2,
    rotation: 1,
    tilt: 0.5,
    panX: 9,
    panY: 8,
  });
});

describe('cam', () => {
  it('처음에는 본부 오른쪽 옆을 똑바로 내려다본다', async () => {
    vi.resetModules();
    const { default: fresh } = await import('./camera');
    expect(fresh).toEqual({
      x: HOUSE_X + 200,
      y: HOUSE_Y,
      zoom: 1,
      rotation: 0,
      tilt: 1,
      panX: 0,
      panY: 0,
      rotationCos: 1,
      rotationSin: 0,
    });
  });
});

describe('syncRotation', () => {
  it('회전각에서 cos와 sin을 맞춘다', () => {
    camera.rotation = Math.PI / 3;
    syncRotation();
    expect(camera.rotationCos).toBeCloseTo(0.5);
    expect(camera.rotationSin).toBeCloseTo(Math.sqrt(3) / 2);
  });
});

describe('resetCam', () => {
  it('시작 모습으로 되돌리고 target을 가운데에 둔다', () => {
    resetCamera({ x: 700, y: 800 });
    expect(camera).toMatchObject({
      x: 700,
      y: 800,
      panX: 0,
      panY: 0,
      rotation: CAMERA_START.rotation,
      tilt: CAMERA_START.tilt,
      zoom: CAMERA_START.zoom,
    });
    expect(camera.rotationCos).toBe(Math.cos(CAMERA_START.rotation));
    expect(camera.rotationSin).toBe(Math.sin(CAMERA_START.rotation));
  });
});
