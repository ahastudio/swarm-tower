import { beforeEach, describe, expect, it } from 'vitest';
import camera from '../camera/camera';
import { calculateLift } from '../camera/projection';
import view from '../camera/view';
import { PONDS } from '../constants';
import { createFakeContext } from '../testing/fakeCanvas';
import { prepareFreshGame } from '../testing/freshGame';
import drawPonds from './drawPonds';

const origin = { x: 600, y: 700 };

beforeEach(() => {
  prepareFreshGame();
  Object.assign(camera, {
    zoom: 1,
    rotation: 0,
    tilt: 1,
    rotationCos: 1,
    rotationSin: 0,
    panX: 0,
    panY: 0,
  });
  Object.assign(view, { width: 1000, height: 600, pixelRatio: 1 });
});

// 카메라를 연못 pond의 중심에 맞춘다
const lookAt = (index: number) => {
  camera.x = PONDS[index][0];
  camera.y = PONDS[index][1];
};

const draw = (index: number) => {
  lookAt(index);
  const fake = createFakeContext();
  drawPonds(fake.context, origin);
  return fake.calls;
};

describe('drawPonds', () => {
  it('화면에 걸치지 않는 연못은 그리지 않는다', () => {
    lookAt(0);
    camera.x += 9000;
    const { context, calls } = createFakeContext();
    drawPonds(context, origin);
    expect(calls).toHaveLength(0);
  });

  it('보이는 연못만 벽 6층과 물을 그린다', () => {
    const calls = draw(0);
    expect(calls.filter((call) => call.name === 'setTransform')).toHaveLength(
      7,
    );
  });

  it('벽은 아래로 층층이 쌓고 층마다 흙색이 짙어진다', () => {
    const calls = draw(0);
    const wall = calls
      .filter((call) => call.name === 'set:fillStyle')
      .map((call) => call.callArguments[0])
      .slice(0, 6);
    expect(wall).toEqual([
      '#b08350',
      '#b08350',
      '#8f6a42',
      '#8f6a42',
      '#6f5035',
      '#6f5035',
    ]);
    const first = calls.filter((call) => call.name === 'setTransform')[0]
      .callArguments;
    expect(first[5]).toBe(origin.y - calculateLift(-2));
    const second = calls.filter((call) => call.name === 'setTransform')[1]
      .callArguments;
    expect(second[5]).toBe(origin.y - calculateLift(-4));
  });

  it('벽 위에 물, 밝은 물결, 반짝임 여섯 개를 그린다', () => {
    const calls = draw(0);
    const [pondX, pondY, radiusX, radiusY] = PONDS[0];
    const ellipses = calls
      .filter((call) => call.name === 'ellipse')
      .map((call) => call.callArguments);
    expect(ellipses).toHaveLength(8);
    expect(ellipses[6]).toEqual([
      pondX,
      pondY,
      radiusX * 0.97,
      radiusY * 0.97,
      0,
      0,
      7,
    ]);
    expect(ellipses[7]).toEqual([
      pondX - radiusX * 0.15,
      pondY - radiusY * 0.2,
      radiusX * 0.68,
      radiusY * 0.58,
      0,
      0,
      7,
    ]);
    const sparkles = calls
      .filter((call) => call.name === 'fillRect')
      .map((call) => call.callArguments);
    expect(sparkles).toHaveLength(6);
    expect(sparkles[1]).toEqual([
      pondX - radiusX * 0.5 + radiusX * 0.2,
      pondY - radiusY * 0.3 + radiusY * 0.4,
      14,
      4,
    ]);
    expect(
      calls
        .filter((call) => call.name === 'set:fillStyle')
        .map((call) => call.callArguments[0])
        .slice(6, 9),
    ).toEqual(['#6cc4e8', '#8fd8f2', '#d6f4ff']);
  });

  it('물의 높이는 구덩이 깊이의 0.65배만큼 내려간다', () => {
    const calls = draw(0);
    const water = calls.filter((call) => call.name === 'setTransform')[6]
      .callArguments;
    expect(water[5]).toBe(origin.y - calculateLift(-12 * 0.65));
  });

  it('여러 연못이 한 화면에 걸치면 모두 그린다', () => {
    lookAt(0);
    camera.zoom = 0.4;
    const { context, calls } = createFakeContext();
    drawPonds(context, origin);
    expect(
      calls.filter((call) => call.name === 'setTransform').length % 7,
    ).toBe(0);
    expect(
      calls.filter((call) => call.name === 'setTransform').length,
    ).toBeGreaterThan(7);
  });
});
