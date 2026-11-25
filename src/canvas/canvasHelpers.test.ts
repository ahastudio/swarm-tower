import { describe, expect, it } from 'vitest';
import { FakePath2D, findContext } from '../testing/fakeCanvas';
import {
  createCanvas,
  createPixelContext,
  getCanvasContext,
  tracePolygon,
} from './canvasHelpers';

describe('context2d', () => {
  it('캔버스의 2D 컨텍스트를 돌려준다', () => {
    const canvas = document.createElement('canvas');
    expect(getCanvasContext(canvas)).toBe(findContext(canvas).context);
  });

  it('컨텍스트를 얻지 못하면 오류를 던진다', () => {
    const broken = { getContext: () => null } as unknown as HTMLCanvasElement;
    expect(() => getCanvasContext(broken)).toThrow('2D 캔버스 컨텍스트');
  });
});

describe('createCanvas', () => {
  it('크기를 정한 캔버스를 만든다', () => {
    const canvas = createCanvas(30, 20);
    expect([canvas.width, canvas.height]).toEqual([30, 20]);
  });
});

describe('pixelContext', () => {
  it('확대해도 도트가 뭉개지지 않게 한다', () => {
    const canvas = createCanvas(4, 4);
    createPixelContext(canvas);
    expect(findContext(canvas).props.imageSmoothingEnabled).toBe(false);
  });
});

describe('tracePolygon', () => {
  it('첫 점으로 옮겨 가 나머지 점을 잇고 닫는다', () => {
    const path = new FakePath2D();
    tracePolygon(path as unknown as Path2D, [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 6 },
    ]);
    expect(path.calls).toEqual([
      { name: 'moveTo', callArguments: [1, 2] },
      { name: 'lineTo', callArguments: [3, 4] },
      { name: 'lineTo', callArguments: [5, 6] },
      { name: 'closePath', callArguments: [] },
    ]);
  });
});
