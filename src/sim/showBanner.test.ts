import { describe, expect, it } from 'vitest';
import game from '../game';
import showBanner from './showBanner';

describe('showBanner', () => {
  it('글자를 정하고 2.4초 동안 보인다', () => {
    showBanner('웨이브 3');
    expect(game.bannerText).toBe('웨이브 3');
    expect(game.banner).toBe(2.4);
  });
});
