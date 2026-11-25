import { beforeEach, describe, expect, it, vi } from 'vitest';
import camera from '../camera/camera';
import { project } from '../camera/projection';
import view from '../camera/view';
import { findContext } from '../testing/fakeCanvas';
import { prepareFreshGame } from '../testing/freshGame';
import type { Stack } from '../types';

const sprite = vi.hoisted(() => ({ default: vi.fn() }));
vi.mock('../sprites/drawSprite', () => sprite);

const { beginScene, flushScene } = await import('./scene');

beforeEach(() => {
  prepareFreshGame();
  sprite.default.mockReset();
  findContext(view.canvas).calls.length = 0;
  Object.assign(camera, {
    x: 2200,
    y: 1400,
    zoom: 1.5,
    rotation: 0,
    tilt: 0.8,
    rotationCos: 1,
    rotationSin: 0,
  });
});

describe('beginScene', () => {
  it('화면 그리기 도구와 줌을 담은 Env를 돌려준다', () => {
    const environment = beginScene();
    expect(environment.context).toBe(view.context);
    expect(environment.zoom).toBe(1.5);
  });

  it('새 장면을 시작하면 이전 목록이 비워진다', () => {
    const draws: string[] = [];
    beginScene().add(1, () => draws.push('old'));
    beginScene();
    flushScene();
    expect(draws).toEqual([]);
  });
});

describe('add와 flushScene', () => {
  it('발의 화면 y가 작은 것(뒤)부터 그린다', () => {
    const order: string[] = [];
    const environment = beginScene();
    environment.add(30, () => order.push('front'));
    environment.add(10, () => order.push('back'));
    environment.add(20, () => order.push('middle'));
    flushScene();
    expect(order).toEqual(['back', 'middle', 'front']);
  });
});

describe('isVisible', () => {
  it('화면 안이면 보이고 여백 밖이면 안 보인다', () => {
    const { isVisible } = beginScene();
    expect(isVisible({ x: 500, y: 300 }, 0)).toBe(true);
    expect(isVisible({ x: -10, y: 300 }, 0)).toBe(false);
    expect(isVisible({ x: -10, y: 300 }, 20)).toBe(true);
    expect(isVisible({ x: 1010, y: 300 }, 0)).toBe(false);
    expect(isVisible({ x: 500, y: -10 }, 0)).toBe(false);
    expect(isVisible({ x: 500, y: 610 }, 0)).toBe(false);
    expect(isVisible({ x: 500, y: 610 }, 20)).toBe(true);
  });
});

describe('place', () => {
  const projectScreenPoint = (x: number, y: number) =>
    project(x, y, { x: 0, y: 0 });

  it('화면 안의 물체는 발 위치와 함께 정렬 목록에 올라 나중에 그려진다', () => {
    const drawn: { x: number; y: number }[] = [];
    beginScene().place({ x: 2200, y: 1400 }, 50, (foot) => drawn.push(foot));
    expect(drawn).toHaveLength(0);
    flushScene();
    expect(drawn).toEqual([projectScreenPoint(2200, 1400)]);
  });

  it('화면 밖의 물체는 올리지 않는다', () => {
    const drawn: unknown[] = [];
    beginScene().place({ x: 90000, y: 1400 }, 50, (foot) => drawn.push(foot));
    flushScene();
    expect(drawn).toHaveLength(0);
  });

  it('발 위치는 복사해 두어 다음 물체를 투영해도 바뀌지 않는다', () => {
    const feet: { x: number; y: number }[] = [];
    const environment = beginScene();
    environment.place({ x: 2200, y: 1400 }, 50, (foot) => feet.push(foot));
    environment.place({ x: 2300, y: 1450 }, 50, (foot) => feet.push(foot));
    flushScene();
    expect(feet).toHaveLength(2);
    expect(feet[0]).not.toEqual(feet[1]);
  });

  it('placeAlways는 화면 밖이어도 올린다', () => {
    const drawn: unknown[] = [];
    beginScene().placeAlways({ x: 90000, y: 1400 }, (foot) => drawn.push(foot));
    flushScene();
    expect(drawn).toHaveLength(1);
  });
});

describe('shadow', () => {
  it('발 밑에 줌에 맞춘 납작한 그림자를 그린다', () => {
    beginScene().shadow({ x: 100, y: 200 }, 10);
    expect(findContext(view.canvas).calls).toEqual([
      { name: 'set:fillStyle', callArguments: ['rgba(50,70,40,.25)'] },
      { name: 'beginPath', callArguments: [] },
      {
        name: 'ellipse',
        callArguments: [100, 200 + 2 * 1.5, 15, 10 * 0.8 * 1.5, 0, 0, 7],
      },
      { name: 'fill', callArguments: [] },
    ]);
  });
});

describe('stack', () => {
  const spriteStack = { id: 'x' } as unknown as Stack;

  it('카메라 회전을 더하고 줌 배율로 층 그림을 그린다', () => {
    camera.rotation = 0.5;
    beginScene().stack(spriteStack, { angle: 1, x: 10, y: 20 });
    const [context, stack, pose] = sprite.default.mock.calls[0];
    expect(context).toBe(view.context);
    expect(stack).toBe(spriteStack);
    expect(pose).toEqual({ angle: 1.5, x: 10, y: 20, scale: 1.5, tilt: 0.8 });
  });

  it('배율 k가 있으면 줌에 곱한다', () => {
    beginScene().stack(spriteStack, { angle: 0, x: 0, y: 0, scale: 2 });
    expect(sprite.default.mock.calls[0][2].scale).toBe(3);
  });
});
