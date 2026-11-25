import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HOUSE_X, HOUSE_Y } from '../constants';
import { spriteAssets } from '../sprites/assets';
import type { Point, Stack } from '../types';
import camera, { syncRotation } from './camera';
import {
  calculateHeadLift,
  calculateLift,
  project,
  projectFlat,
  unproject,
} from './projection';
import view from './view';

const idle = { layerCount: 10, lift: 2 } as Stack;

beforeEach(() => {
  Object.assign(view, { width: 1000, height: 600 });
  Object.assign(camera, {
    x: 1000,
    y: 1000,
    zoom: 1,
    rotation: 0,
    tilt: 1,
    panX: 0,
    panY: 0,
    rotationCos: 1,
    rotationSin: 0,
  });
});

afterEach(() => {
  delete (spriteAssets as { manIdle?: Stack }).manIdle;
});

describe('lift', () => {
  it('섬 높이를 줌에 맞춰 키운다', () => {
    camera.zoom = 2;
    expect(calculateLift()).toBe(44);
  });

  it('카메라를 낮추면 높이가 더 크게 보인다', () => {
    camera.tilt = 0.5;
    expect(calculateLift(10)).toBe(15);
  });
});

describe('headLift', () => {
  it('주인공 그림이 없으면 0이다', () => {
    expect(calculateHeadLift()).toBe(0);
  });

  it('주인공의 키 높이만큼이다', () => {
    spriteAssets.manIdle = idle;
    camera.zoom = 2;
    expect(calculateHeadLift()).toBe(10 * 2 * 1 * 2);
  });
});

describe('flat', () => {
  it('카메라 중심은 화면 가운데에 온다', () => {
    const out = projectFlat(1000, 1000, { x: 0, y: 0 });
    expect(out).toEqual({ x: 500, y: 300 });
  });

  it('줌과 높낮이를 곱해 위아래를 누른다', () => {
    camera.zoom = 2;
    camera.tilt = 0.5;
    const out = projectFlat(1010, 1020, { x: 0, y: 0 });
    expect(out.x).toBeCloseTo(500 + 20);
    expect(out.y).toBeCloseTo(300 + 20 * 2 * 0.5);
  });

  it('카메라가 돌면 같은 점이 돌아서 보인다', () => {
    camera.rotation = Math.PI / 2;
    camera.rotationCos = Math.cos(camera.rotation);
    camera.rotationSin = Math.sin(camera.rotation);
    const out = projectFlat(1010, 1000, { x: 0, y: 0 });
    expect(out.x).toBeCloseTo(500);
    expect(out.y).toBeCloseTo(310);
  });

  it('돌려주는 점이 넘겨준 점이다', () => {
    const out = { x: 0, y: 0 };
    expect(projectFlat(1, 2, out)).toBe(out);
  });

  it('이동한 만큼(px, py) 중심에서 벗어난다', () => {
    Object.assign(camera, { panX: 10, panY: 20 });
    const out = projectFlat(1000, 1000, { x: 0, y: 0 });
    expect(out).toEqual({ x: 490, y: 280 });
  });
});

describe('proj와 unproj', () => {
  it('땅 높이만큼 y를 위로 올린다', () => {
    const [x, y] = [HOUSE_X, HOUSE_Y];
    const flatPoint = projectFlat(x, y, { x: 0, y: 0 });
    const out = project(x, y, { x: 0, y: 0 });
    expect(out.x).toBe(flatPoint.x);
    expect(out.y).toBe(flatPoint.y - calculateLift() - calculateLift(0));
  });

  it('화면 좌표를 월드 좌표로 되돌린다', () => {
    Object.assign(camera, {
      x: HOUSE_X,
      y: HOUSE_Y,
      zoom: 1.7,
      tilt: 0.6,
      rotation: 0.8,
    });
    camera.rotationCos = Math.cos(camera.rotation);
    camera.rotationSin = Math.sin(camera.rotation);
    spriteAssets.manIdle = idle;
    const screen = project(HOUSE_X + 30, HOUSE_Y + 70, { x: 0, y: 0 });
    const back = unproject(screen.x, screen.y, { x: 0, y: 0 });
    expect(back.x).toBeCloseTo(HOUSE_X + 30, 6);
    expect(back.y).toBeCloseTo(HOUSE_Y + 70, 6);
  });
});

describe('평행 투영', () => {
  const measureScreenSpan = (origin: Point, offset: Point) => {
    const first = { x: 0, y: 0 };
    const second = { x: 0, y: 0 };
    projectFlat(origin.x, origin.y, first);
    projectFlat(origin.x + offset.x, origin.y + offset.y, second);
    return { x: second.x - first.x, y: second.y - first.y };
  };

  it('여러 카메라 상태에서 가까운 곳과 먼 곳의 같은 길이가 화면에서도 같다', () => {
    for (let index = 0; index < 40; index++) {
      Object.assign(camera, {
        rotation: (index * 0.7) % 6.28,
        tilt: 0.35 + (index % 13) * 0.05,
        zoom: 0.4 + (index % 7) * 0.4,
      });
      syncRotation();
      const origin = {
        x: 100 + ((index * 91) % 4000),
        y: 100 + ((index * 57) % 2600),
      };
      const offset = { x: 37 + index, y: 11 + index * 2 };
      const near = measureScreenSpan(origin, offset);
      const far = measureScreenSpan(
        { x: origin.x + 5000, y: origin.y + 3000 },
        offset,
      );
      expect(far.x).toBeCloseTo(near.x, 6);
      expect(far.y).toBeCloseTo(near.y, 6);
    }
  });
});
