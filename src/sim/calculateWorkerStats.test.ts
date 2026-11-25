import { afterEach, describe, expect, it } from 'vitest';
import house from '../world/house';
import calculateWorkerStats from './calculateWorkerStats';

afterEach(() => {
  house.level = 1;
});

describe('calculateWorkerStats', () => {
  it('본부 레벨 1은 기본 값이다', () => {
    expect(calculateWorkerStats()).toEqual({
      damage: 1,
      blast: 40,
      rate: 0.35,
      range: 320,
    });
  });

  it('본부 레벨이 오르면 공격이 세진다', () => {
    house.level = 4;
    const stats = calculateWorkerStats();
    expect(stats.damage).toBe(3);
    expect(stats.blast).toBe(58);
    expect(stats.rate).toBeCloseTo(0.35 * 0.92 ** 3);
    expect(stats.range).toBe(395);
  });
});
