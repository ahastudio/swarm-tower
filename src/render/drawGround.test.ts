import { beforeEach, describe, expect, it, vi } from 'vitest';
import camera from '../camera/camera';
import { project, scratchFirst } from '../camera/projection';
import view from '../camera/view';
import { findContext } from '../testing/fakeCanvas';
import { prepareFreshGame } from '../testing/freshGame';

const order = vi.hoisted(() => [] as string[]);
const layers = vi.hoisted(() => ({
  sea: { id: 'sea' },
  bands: [{ id: 'band0' }, { id: 'band1' }],
  top: { id: 'top' },
}));

vi.mock('./drawPonds', () => ({ default: () => order.push('ponds') }));
vi.mock('./drawTerrainLevels', () => ({
  default: () => order.push('terrain'),
}));
vi.mock('./drawSpotPads', () => ({ default: () => order.push('pads') }));
vi.mock('./getGroundLayers', () => ({
  default: () => layers,
  GROUND_SCALE: 0.5,
}));

const { default: drawGround } = await import('./drawGround');

beforeEach(() => {
  prepareFreshGame();
  order.length = 0;
  Object.assign(camera, {
    x: 2200,
    y: 1400,
    zoom: 1,
    rotation: 0,
    tilt: 1,
    rotationCos: 1,
    rotationSin: 0,
    panX: 0,
    panY: 0,
  });
  Object.assign(view, { width: 1000, height: 600, pixelRatio: 2 });
  findContext(view.canvas).calls.length = 0;
});

const calls = () => findContext(view.canvas).calls;
const collectDrawnIds = () =>
  calls()
    .filter((call) => call.name === 'drawImage')
    .map((call) => (call.callArguments[0] as { id: string }).id);

describe('drawGround 화면 지우기', () => {
  it('화면 배율로 바다색 바탕을 칠하고 도트가 뭉개지지 않게 한다', () => {
    drawGround();
    expect(calls().slice(0, 4)).toEqual([
      { name: 'setTransform', callArguments: [2, 0, 0, 2, 0, 0] },
      { name: 'set:imageSmoothingEnabled', callArguments: [false] },
      { name: 'set:fillStyle', callArguments: ['#4db6e6'] },
      { name: 'fillRect', callArguments: [0, 0, 1000, 600] },
    ]);
  });

  it('끝나면 변환을 화면 배율로 되돌린다', () => {
    drawGround();
    expect(calls().at(-1)).toEqual({
      name: 'setTransform',
      callArguments: [2, 0, 0, 2, 0, 0],
    });
  });
});

describe('drawGround 순서', () => {
  it('바다, 섬 옆면 10층, 섬 윗면 순서로 그린다', () => {
    drawGround();
    expect(collectDrawnIds()).toEqual([
      'sea',
      ...Array(6).fill('band0'),
      ...Array(4).fill('band1'),
      'top',
    ]);
  });

  it('그다음 연못, 땅 높이 층, 타워 판 순서다', () => {
    drawGround();
    expect(order).toEqual(['ponds', 'terrain', 'pads']);
  });

  it('섬 옆면은 위로 2씩 쌓아 올린 위치에 놓는다', () => {
    drawGround();
    const transforms = calls()
      .filter((call) => call.name === 'setTransform')
      .slice(1, 12);
    const corner = project(-300, -300, { x: 0, y: 0 });
    expect(transforms[0].callArguments.slice(4)).toEqual([
      2 * corner.x,
      2 * (corner.y + 22),
    ]);
    expect(transforms[1].callArguments[5]).toBe(2 * (corner.y + 22 - 2));
    expect(transforms[2].callArguments[5]).toBe(2 * (corner.y + 22 - 4));
  });

  it('원점이 화면 어디인지와 그림 모서리 위치를 따로 잰다', () => {
    drawGround();
    const corner = project(-300, -300, { x: 0, y: 0 });
    expect(scratchFirst.x).toBe(corner.x);
  });
});
