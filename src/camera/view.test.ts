import { afterEach, describe, expect, it, vi } from 'vitest';
import { findContext } from '../testing/fakeCanvas';
import view, { initializeView, resizeView } from './view';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('view', () => {
  it('캔버스와 그 컨텍스트를 갖는다', () => {
    expect(view.canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(view.context).toBe(findContext(view.canvas).context);
  });
});

describe('resizeView', () => {
  it('창 크기와 화면 배율에 맞춰 캔버스 크기를 정한다', () => {
    vi.stubGlobal('innerWidth', 800);
    vi.stubGlobal('innerHeight', 600);
    vi.stubGlobal('devicePixelRatio', 1.5);
    resizeView();
    expect([view.width, view.height, view.pixelRatio]).toEqual([800, 600, 1.5]);
    expect([view.canvas.width, view.canvas.height]).toEqual([1200, 900]);
  });

  it('화면 배율은 2까지만 쓴다', () => {
    vi.stubGlobal('devicePixelRatio', 3);
    resizeView();
    expect(view.pixelRatio).toBe(2);
  });

  it('화면 배율을 모르면 1로 본다', () => {
    vi.stubGlobal('devicePixelRatio', 0);
    resizeView();
    expect(view.pixelRatio).toBe(1);
  });
});

describe('initView', () => {
  it('캔버스를 body 맨 앞에 놓고 창 크기가 바뀔 때마다 다시 맞춘다', () => {
    vi.stubGlobal('devicePixelRatio', 1);
    vi.stubGlobal('innerWidth', 500);
    initializeView();
    expect(document.body.firstElementChild).toBe(view.canvas);
    expect(view.width).toBe(500);
    vi.stubGlobal('innerWidth', 640);
    dispatchEvent(new Event('resize'));
    expect(view.width).toBe(640);
  });
});
