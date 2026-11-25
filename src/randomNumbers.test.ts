import { beforeEach, describe, expect, it } from 'vitest';
import { nextRandom, randomState, withSeed } from './randomNumbers';

beforeEach(() => {
  randomState.seed = 7;
});

describe('rnd', () => {
  it('같은 시드에서는 같은 순서로 같은 값이 나온다', () => {
    const first = [nextRandom(), nextRandom(), nextRandom()];
    randomState.seed = 7;
    expect([nextRandom(), nextRandom(), nextRandom()]).toEqual(first);
  });

  it('시드 7의 첫 값은 알려진 값이다', () => {
    expect(nextRandom()).toBe((7 * 16807) / 2147483647);
  });

  it('값은 0과 1 사이다', () => {
    for (let index = 0; index < 100; index++) {
      const value = nextRandom();
      expect(value).toBeGreaterThan(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('withSeed', () => {
  it('시드를 바꿔 만든 결과를 돌려주고 원래 시드로 되돌린다', () => {
    nextRandom();
    const before = randomState.seed;
    const result = withSeed(3, () => [nextRandom(), randomState.seed]);
    expect(result[0]).toBe((3 * 16807) / 2147483647);
    expect(randomState.seed).toBe(before);
  });
});
