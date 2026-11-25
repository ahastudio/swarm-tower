import { describe, expect, it } from 'vitest';
import { createSpot, createUpgradeSpot } from './spots';

describe('newSpot', () => {
  it('아직 아무것도 내지 않은 타워 판을 만든다', () => {
    expect(createSpot({ x: 10, y: 20 }, 15)).toEqual({
      x: 10,
      y: 20,
      cost: 15,
      paid: 0,
      isBuilt: false,
      coinCharge: 0,
      pulse: 0,
      born: 0,
    });
  });

  it('타워 판에는 up 표시가 없다', () => {
    expect(createSpot({ x: 0, y: 0 }, 1).isUpgrade).toBeUndefined();
  });
});

describe('newUpgradeSpot', () => {
  it('본부를 키우는 판은 up 표시가 있다', () => {
    const spot = createUpgradeSpot({ x: 5, y: 6 }, 60);
    expect(spot.isUpgrade).toBe(true);
    expect(spot).toMatchObject({
      x: 5,
      y: 6,
      cost: 60,
      paid: 0,
      isBuilt: false,
    });
  });
});
