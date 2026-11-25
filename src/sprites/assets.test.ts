import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SheetEntry, Stack } from '../types';

const loader = vi.hoisted(() => ({ default: vi.fn() }));
vi.mock('./loadStack', () => loader);

const { spriteAssets, loadAssets } = await import('./assets');

const createEntry = (file: string): SheetEntry => ({
  file,
  textureSize: 4,
  columns: 1,
  layerCount: 1,
  lift: 1,
  width: 4,
  height: 4,
});

const manifest = {
  base: createEntry('base.png'),
  fence: createEntry('fence.png'),
  gate: createEntry('gate.png'),
  cannon: createEntry('cannon.png'),
  manIdle: createEntry('idle.png'),
  houses: [createEntry('house1.png'), createEntry('house2.png')],
  enemies: [createEntry('chick.png')],
  manWalk: [createEntry('walk0.png'), createEntry('walk1.png')],
  manThrow: [createEntry('throw0.png')],
  props: { tree: createEntry('tree.png'), rock: createEntry('rock.png') },
};

function stubManifest(value: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ json: async () => value })),
  );
}

beforeEach(() => {
  loader.default.mockImplementation(
    async (directory: string, sheetEntry: SheetEntry) =>
      ({ loaded: directory + sheetEntry.file }) as unknown as Stack,
  );
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ json: async () => manifest })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('loadAssets', () => {
  it('manifest.json을 읽어 모든 층 그림을 S에 채운다', async () => {
    await loadAssets(() => undefined);
    expect(fetch).toHaveBeenCalledWith('/sprites/manifest.json');
    expect(spriteAssets.base).toEqual({ loaded: '/sprites/base.png' });
    expect(spriteAssets.manIdle).toEqual({ loaded: '/sprites/idle.png' });
    expect(spriteAssets.gate).toEqual({ loaded: '/sprites/gate.png' });
    expect(spriteAssets.cannon).toEqual({ loaded: '/sprites/cannon.png' });
    expect(spriteAssets.fence).toEqual({ loaded: '/sprites/fence.png' });
  });

  it('목록은 순서를 지켜 읽는다', async () => {
    await loadAssets(() => undefined);
    expect(spriteAssets.houses).toEqual([
      { loaded: '/sprites/house1.png' },
      { loaded: '/sprites/house2.png' },
    ]);
    expect(spriteAssets.enemies).toEqual([{ loaded: '/sprites/chick.png' }]);
    expect(spriteAssets.manWalk).toHaveLength(2);
    expect(spriteAssets.manThrow).toEqual([{ loaded: '/sprites/throw0.png' }]);
  });

  it('꾸밈 그림은 이름으로 찾을 수 있게 담는다', async () => {
    await loadAssets(() => undefined);
    expect(spriteAssets.props).toEqual({
      tree: { loaded: '/sprites/tree.png' },
      rock: { loaded: '/sprites/rock.png' },
    });
  });

  it('진행은 층이 많은 시트일수록 크게 올라 1에서 끝난다', async () => {
    const heavy = { ...createEntry('house1.png'), layerCount: 13 };
    stubManifest({ ...manifest, houses: [heavy, createEntry('house2.png')] });
    const ratios: number[] = [];
    await loadAssets((ratio) => ratios.push(ratio));
    expect(ratios).toHaveLength(13);
    expect(ratios[ratios.length - 1]).toBe(1);
    expect(ratios).toEqual([...ratios].sort((first, second) => first - second));
    expect(
      Math.max(
        ...ratios.map((ratio, index) => ratio - (ratios[index - 1] ?? 0)),
      ),
    ).toBeCloseTo(13 / 25);
  });
});
