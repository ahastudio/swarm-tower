import { spriteAssets } from '../sprites/assets';
import type { Stack } from '../types';

// 이름표(id)만 붙인 가짜 층 그림
export const createFakeStack = (
  id: string,
  layerCount = 4,
  lift = 2,
  width = 20,
  height = 20,
) =>
  ({
    id,
    layers: [],
    rims: [],
    layerCount,
    lift,
    width,
    height,
    cache: new Map(),
  }) as unknown as Stack & {
    id: string;
  };

// S를 가짜 층 그림으로 채운다
export function installFakeAssets() {
  const createStacks = (name: string, count: number) =>
    Array.from({ length: count }, (_, index) =>
      createFakeStack(`${name}${index}`),
    );
  Object.assign(spriteAssets, {
    base: createFakeStack('base', 3, 5),
    fence: createFakeStack('fence'),
    gate: createFakeStack('gate'),
    cannon: createFakeStack('cannon', 2, 4),
    manIdle: createFakeStack('manIdle', 6, 3),
    houses: createStacks('house', 5),
    enemies: createStacks('enemy', 7),
    manWalk: createStacks('walk', 3),
    manThrow: createStacks('throw', 4),
    props: {
      tree: createFakeStack('tree', 5, 2, 30),
      pine: createFakeStack('pine'),
      bush: createFakeStack('bush'),
      mush: createFakeStack('mush'),
      redf: createFakeStack('redf'),
      yelf: createFakeStack('yelf'),
      rock: createFakeStack('rock'),
      stone: createFakeStack('stone'),
    },
  });
}

export const readId = (stack: Stack) => (stack as unknown as { id: string }).id;
