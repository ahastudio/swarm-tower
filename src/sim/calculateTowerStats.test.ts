import { describe, expect, it } from 'vitest';
import calculateTowerStats from './calculateTowerStats';

describe('calculateTowerStats', () => {
  it('레벨 1은 기본 값이다', () => {
    expect(calculateTowerStats(1)).toEqual({
      blast: 64,
      rate: 1,
      range: 420,
      damage: 1,
    });
  });

  it('레벨이 오를수록 폭발이 넓고 빠르고 멀리 닿고 세다', () => {
    const level3 = calculateTowerStats(3);
    expect(level3.blast).toBe(84);
    expect(level3.rate).toBeCloseTo(0.85 ** 2);
    expect(level3.range).toBe(480);
    expect(level3.damage).toBe(2);
  });

  it('레벨 5의 피해는 3이다', () => {
    expect(calculateTowerStats(5).damage).toBe(3);
  });
});
