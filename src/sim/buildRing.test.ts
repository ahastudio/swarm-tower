import { describe, expect, it } from 'vitest';
import buildRing from './buildRing';

describe('buildRing', () => {
  it('처음부터 시작하는 고리를 만든다', () => {
    expect(buildRing({ x: 3, y: 4 }, 50)).toEqual({
      x: 3,
      y: 4,
      age: 0,
      radius: 50,
      isBuildEffect: true,
    });
  });

  it('이미 지난 시간을 줄 수 있다', () => {
    expect(buildRing({ x: 3, y: 4 }, 18, 0.25).age).toBe(0.25);
  });
});
