import { describe, expect, it } from 'vitest';
import { makeEnemy } from '../testing/factories';
import calculateLeadPoint from './calculateLeadPoint';

describe('calculateLeadPoint', () => {
  it('걸어가는 적의 앞을 겨눈다', () => {
    const enemy = makeEnemy({ x: 100, y: 200, velocityX: 10, velocityY: -20 });
    expect(calculateLeadPoint(enemy, 0.5)).toEqual({ x: 105, y: 190 });
  });

  it('서 있는 적은 그 자리를 겨눈다', () => {
    expect(calculateLeadPoint(makeEnemy({ x: 7, y: 9 }), 1)).toEqual({
      x: 7,
      y: 9,
    });
  });
});
