import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountGameDom } from '../testing/mountDom';
import { hideLoading, nextFrame, setLoading, showLoading } from './loading';

beforeEach(() => {
  mountGameDom();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('setLoading', () => {
  it('진행 막대의 너비와 안내 글자를 바꾼다', () => {
    setLoading(70, '그리는 중');
    expect(
      document.querySelector<HTMLElement>('#loading-bar i')?.style.width,
    ).toBe('70%');
    expect(document.getElementById('loading-message')?.textContent).toBe(
      '그리는 중',
    );
  });
});

describe('nextFrame', () => {
  it('다음 화면 갱신 때 끝난다', async () => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      setTimeout(() => callback(0), 16);
      return 1;
    });
    let done = false;
    const waiting = nextFrame().then(() => {
      done = true;
    });
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(16);
    await waiting;
    expect(done).toBe(true);
  });
});

describe('hideLoading', () => {
  it('서서히 사라진 뒤 로딩 화면을 지운다', () => {
    hideLoading();
    expect(document.getElementById('loading')?.style.opacity).toBe('0');
    vi.advanceTimersByTime(449);
    expect(document.getElementById('loading')).not.toBeNull();
    vi.advanceTimersByTime(1);
    expect(document.getElementById('loading')).toBeNull();
  });
});

describe('showLoading', () => {
  it('처음에는 숨겨진 로딩 화면을 표시한다', () => {
    expect(document.getElementById('loading')?.hidden).toBe(true);
    showLoading();
    expect(document.getElementById('loading')?.hidden).toBe(false);
  });
});
