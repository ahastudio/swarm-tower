import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountGameDom } from '../testing/mountDom';
import {
  startDeveloperInformation,
  tickDeveloperInformation,
} from './developerInformation';

const panel = () =>
  document.getElementById('developer-information') as HTMLElement;

beforeEach(() => {
  mountGameDom();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('개발 서버', () => {
  it('시작하면 개발자 정보가 보이고 fps를 센다', () => {
    startDeveloperInformation(1000);
    expect(panel().hidden).toBe(false);
    for (let frame = 0; frame < 4; frame++) {
      tickDeveloperInformation(1000 + (frame + 1) * 125);
    }
    expect(panel().textContent).toBe('8 fps');
  });
});

describe('배포판', () => {
  it('개발자 정보를 보이지 않고 fps도 세지 않는다', () => {
    vi.stubEnv('DEV', false);
    startDeveloperInformation(1000);
    tickDeveloperInformation(2000);
    expect(panel().hidden).toBe(true);
    expect(panel().textContent).toBe('-- fps');
  });
});
