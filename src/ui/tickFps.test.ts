import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountGameDom } from '../testing/mountDom';

let tickFps: (now: number) => void;
let startFpsCounter: (now: number) => void;

beforeEach(async () => {
  mountGameDom();
  vi.resetModules();
  const module = await import('./tickFps');
  tickFps = module.default;
  startFpsCounter = module.startFpsCounter;
  startFpsCounter(1000);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const readShownText = () =>
  document.getElementById('developer-information')?.textContent;

describe('tickFps', () => {
  it('0.5초가 지나기 전에는 표시를 바꾸지 않는다', () => {
    tickFps(1100);
    tickFps(1499);
    expect(readShownText()).toBe('-- fps');
  });

  it('0.5초마다 그동안의 프레임 수로 fps를 표시한다', () => {
    tickFps(1100);
    tickFps(1200);
    tickFps(1300);
    tickFps(1500);
    expect(readShownText()).toBe('8 fps');
  });

  it('표시한 뒤에는 처음부터 다시 센다', () => {
    tickFps(1500);
    tickFps(1600);
    tickFps(2000);
    expect(readShownText()).toBe('4 fps');
  });
});
