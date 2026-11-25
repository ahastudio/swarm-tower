import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { findContext } from '../testing/fakeCanvas';
import type { SheetEntry } from '../types';
import loadStack from './loadStack';

class FakeImage {
  src = '';
  decode = vi.fn(async () => undefined);
}

const entry: SheetEntry = {
  file: 'tree.png',
  textureSize: 4,
  columns: 2,
  layerCount: 3,
  lift: 2,
  width: 12,
  height: 14,
};

beforeEach(() => {
  vi.stubGlobal('Image', FakeImage);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('loadStack', () => {
  it('시트 이미지를 읽고 층 수만큼 층 그림과 윤곽 그림을 만든다', async () => {
    const stack = await loadStack('/sprites/', entry);
    expect(stack.layers).toHaveLength(3);
    expect(stack.rims).toHaveLength(3);
    expect(stack).toMatchObject({
      layerCount: 3,
      lift: 2,
      width: 12,
      height: 14,
    });
    expect(stack.cache.size).toBe(0);
  });

  it('칸 하나(tex x tex)로 자른 캔버스를 만든다', async () => {
    const { layers, rims } = await loadStack('/sprites/', entry);
    for (const canvas of [...layers, ...rims]) {
      expect([canvas.width, canvas.height]).toEqual([4, 4]);
    }
  });

  it('시트에서 층 i번째 칸을 가로 cols칸 격자에서 잘라 그린다', async () => {
    const { layers } = await loadStack('/sprites/', entry);
    const cuts = layers.map((canvas) =>
      findContext(canvas)
        .calls.find((call) => call.name === 'drawImage')
        ?.callArguments.slice(1),
    );
    expect(cuts).toEqual([
      [0, 0, 4, 4, 0, 0, 4, 4],
      [4, 0, 4, 4, 0, 0, 4, 4],
      [0, 4, 4, 4, 0, 0, 4, 4],
    ]);
    expect(findContext(layers[0]).props.imageSmoothingEnabled).toBe(false);
  });

  it('윤곽 그림은 층 모양을 윤곽 색으로 채워 여덟 방향으로 밀어 겹친다', async () => {
    const { layers, rims } = await loadStack('/sprites/', entry);
    const { calls } = findContext(rims[0]);
    const offsets = calls
      .filter((call) => call.name === 'drawImage')
      .map((call) => call.callArguments.slice(1));
    expect(offsets).toEqual([
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
    ]);
    const shadow = calls[0].callArguments[0] as HTMLCanvasElement;
    const shadowContext = findContext(shadow);
    expect(shadowContext.calls[0]).toEqual({
      name: 'drawImage',
      callArguments: [layers[0], 0, 0],
    });
    expect(shadowContext.props).toMatchObject({
      globalCompositeOperation: 'source-in',
      fillStyle: '#2a2340',
    });
    expect(shadowContext.calls.at(-1)).toEqual({
      name: 'fillRect',
      callArguments: [0, 0, 4, 4],
    });
  });

  it('이미지는 폴더 + 파일 이름으로 읽는다', async () => {
    const images: FakeImage[] = [];
    vi.stubGlobal(
      'Image',
      class extends FakeImage {
        constructor() {
          super();
          images.push(this);
        }
      },
    );
    await loadStack('/sprites/', entry);
    expect(images[0].src).toBe('/sprites/tree.png');
    expect(images[0].decode).toHaveBeenCalled();
  });
});
