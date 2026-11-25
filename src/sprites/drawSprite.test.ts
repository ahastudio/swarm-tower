import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeContext } from '../testing/fakeCanvas';
import type { Built, Stack } from '../types';

const bake = vi.hoisted(() => ({ bakeStack: vi.fn() }));
vi.mock('./bakeStack', async (importOriginal) => {
  const original = await importOriginal<typeof import('./bakeStack')>();
  return { ...original, default: bake.bakeStack };
});

const { default: drawSprite, budget } = await import('./drawSprite');

const makeStack = () =>
  ({
    layers: [{}, {}],
    rims: [{}, {}],
    count: 2,
    lift: 3,
    width: 10,
    height: 10,
    cache: new Map<number, Built>(),
  }) as unknown as Stack;

const createBuilt = (): Built => ({
  canvas: { width: 40, height: 30 } as HTMLCanvasElement,
  originX: 20,
  originY: 25,
});

beforeEach(() => {
  budget.count = 0;
  bake.bakeStack.mockReset();
  bake.bakeStack.mockImplementation(createBuilt);
});

describe('drawSprite 합친 그림', () => {
  const pose = { angle: 0, x: 100, y: 200, scale: 2, tilt: 1 };

  it('처음에는 합쳐서 캐시에 넣고 그 그림을 발 위치에 맞춰 그린다', () => {
    const { context, calls } = createFakeContext();
    const stack = makeStack();
    drawSprite(context, stack, pose);
    expect(bake.bakeStack).toHaveBeenCalledWith(stack, { angle: 0, tilt: 1 });
    expect(stack.cache.size).toBe(1);
    expect(budget.count).toBe(1);
    expect(calls).toEqual([
      {
        name: 'drawImage',
        callArguments: [expect.anything(), 100 - 20 * 2, 200 - 25 * 2, 80, 60],
      },
    ]);
  });

  it('같은 각도와 높낮이는 캐시를 쓰고 새로 합치지 않는다', () => {
    const stack = makeStack();
    drawSprite(createFakeContext().context, stack, pose);
    drawSprite(createFakeContext().context, stack, { ...pose, x: 5 });
    expect(bake.bakeStack).toHaveBeenCalledTimes(1);
    expect(budget.count).toBe(1);
  });

  it('각도는 64단계, 높낮이는 14단계로 나눈다', () => {
    const stack = makeStack();
    drawSprite(createFakeContext().context, stack, {
      ...pose,
      angle: Math.PI,
      tilt: 0.75,
    });
    const [, view] = bake.bakeStack.mock.calls[0];
    expect(view.angle).toBeCloseTo(Math.PI);
    expect(view.tilt).toBeCloseTo(0.5 + (7 / 14) * 0.5);
  });

  it('음수 각도도 0에서 한 바퀴 안의 단계가 된다', () => {
    const stack = makeStack();
    drawSprite(createFakeContext().context, stack, {
      ...pose,
      angle: -Math.PI / 2,
    });
    const [, view] = bake.bakeStack.mock.calls[0];
    expect(view.angle).toBeCloseTo((3 * Math.PI) / 2);
  });
});

describe('drawSprite 합칠 여유가 없을 때', () => {
  const pose = { angle: Math.PI, x: 100, y: 200, scale: 2, tilt: 0.75 };

  it('이번 프레임에 8장을 합쳤으면 층을 하나씩 바로 그린다', () => {
    budget.count = 8;
    const { context, calls } = createFakeContext();
    const stack = makeStack();
    drawSprite(context, stack, pose);
    expect(bake.bakeStack).not.toHaveBeenCalled();
    expect(stack.cache.size).toBe(0);
    expect(calls.filter((call) => call.name === 'drawImage')).toHaveLength(4);
  });

  it('바로 그릴 때는 단계로 나눈 각도와 높낮이를 쓴다', () => {
    budget.count = 8;
    const { context, calls } = createFakeContext();
    drawSprite(context, makeStack(), pose);
    const tilt = 0.5 + (7 / 14) * 0.5;
    expect(calls.find((call) => call.name === 'scale')?.callArguments).toEqual([
      2,
      2 * tilt,
    ]);
    expect(
      calls.find((call) => call.name === 'rotate')?.callArguments[0],
    ).toBeCloseTo(Math.PI);
    expect(
      calls.find((call) => call.name === 'translate')?.callArguments,
    ).toEqual([100, 200]);
  });

  it('캐시에 있으면 여유가 없어도 그 그림을 쓴다', () => {
    const stack = makeStack();
    drawSprite(createFakeContext().context, stack, pose);
    budget.count = 8;
    const { context, calls } = createFakeContext();
    drawSprite(context, stack, pose);
    expect(calls).toHaveLength(1);
    expect(calls[0].name).toBe('drawImage');
  });
});
