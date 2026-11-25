import { describe, expect, it } from 'vitest';
import {
  calculateHeading,
  clamp,
  measureSegmentDistance,
  repeatTimes,
  smoothstep,
  swapRemove,
} from './mathHelpers';

describe('clamp', () => {
  it('범위 안의 값은 그대로 둔다', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('범위 밖의 값은 끝으로 맞춘다', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(30, 0, 10)).toBe(10);
  });
});

describe('heading', () => {
  it('아래쪽으로 가는 방향은 0이다', () => {
    expect(calculateHeading(0, 1)).toBeCloseTo(0);
  });

  it('오른쪽 방향은 -90도다', () => {
    expect(calculateHeading(1, 0)).toBeCloseTo(-Math.PI / 2);
  });
});

describe('sstep', () => {
  it('양 끝에서 0과 1이고 가운데에서 0.5다', () => {
    expect(smoothstep(10, 20, 5)).toBe(0);
    expect(smoothstep(10, 20, 25)).toBe(1);
    expect(smoothstep(10, 20, 15)).toBe(0.5);
  });
});

describe('segDist', () => {
  const segment: [number, number, number, number] = [0, 0, 10, 0];

  it('선분 위의 점까지는 거리가 0이다', () => {
    expect(measureSegmentDistance(4, 0, segment)).toBe(0);
  });

  it('수직으로 내린 거리를 잰다', () => {
    expect(measureSegmentDistance(4, 3, segment)).toBe(3);
  });

  it('끝점 너머는 끝점까지의 거리다', () => {
    expect(measureSegmentDistance(13, 4, segment)).toBe(5);
    expect(measureSegmentDistance(-3, 4, segment)).toBe(5);
  });
});

describe('swapRemove', () => {
  it('지운 자리에 맨 뒤 원소를 넣고 줄인다', () => {
    const items = ['a', 'b', 'c', 'd'];
    swapRemove(items, 1);
    expect(items).toEqual(['a', 'd', 'c']);
  });

  it('맨 뒤 원소를 지우면 그냥 줄어든다', () => {
    const items = ['a', 'b'];
    swapRemove(items, 1);
    expect(items).toEqual(['a']);
  });
});

describe('times', () => {
  it('횟수만큼 부른다', () => {
    let count = 0;
    repeatTimes(4, () => {
      count++;
    });
    expect(count).toBe(4);
  });
});
