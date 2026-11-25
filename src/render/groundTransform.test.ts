import { beforeEach, describe, expect, it } from 'vitest';
import camera from '../camera/camera';
import { calculateLift } from '../camera/projection';
import view from '../camera/view';
import { createFakeContext } from '../testing/fakeCanvas';
import { setLayerTransform, setWorldTransform } from './groundTransform';

beforeEach(() => {
  view.pixelRatio = 2;
  Object.assign(camera, { zoom: 1.5, rotation: 0.5, tilt: 0.7 });
  camera.rotationCos = Math.cos(0.5);
  camera.rotationSin = Math.sin(0.5);
});

// DPR x 줌에 회전의 cos, sin과 높낮이를 곱한 2x3 행렬
const createMatrix = (scale: number) => {
  const pixelScale = 2 * 1.5;
  return [
    pixelScale * camera.rotationCos * scale,
    pixelScale * camera.rotationSin * 0.7 * scale,
    -pixelScale * camera.rotationSin * scale,
    pixelScale * camera.rotationCos * 0.7 * scale,
  ];
};

describe('setWorldTransform', () => {
  it('월드 좌표 1단위가 1px인 변환을 원점 위치에 맞추고 높이만큼 올린다', () => {
    const { context, calls } = createFakeContext();
    setWorldTransform(context, { x: 100, y: 200 }, 10);
    expect(calls).toEqual([
      {
        name: 'setTransform',
        callArguments: [
          ...createMatrix(1),
          2 * 100,
          2 * (200 - calculateLift(10)),
        ],
      },
    ]);
  });

  it('높이 0이면 원점 그대로다', () => {
    const { context, calls } = createFakeContext();
    setWorldTransform(context, { x: 100, y: 200 }, 0);
    expect(calls[0].callArguments.slice(4)).toEqual([200, 400]);
  });
});

describe('setLayerTransform', () => {
  it('미리 그린 반 해상도 그림을 두 배로 늘려 모서리 위치에 놓는다', () => {
    const { context, calls } = createFakeContext();
    setLayerTransform(context, { x: 30, y: 40 }, 6);
    expect(calls).toEqual([
      {
        name: 'setTransform',
        callArguments: [...createMatrix(2), 2 * 30, 2 * (40 + 6)],
      },
    ]);
  });
});
