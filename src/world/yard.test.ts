import { afterEach, describe, expect, it } from 'vitest';
import { FENCE_STEP, HOUSE_X, HOUSE_Y } from '../constants';
import house from './house';
import {
  buildFencePieces,
  calculateYard,
  FENCES,
  fencePieces,
  isInYardArea,
  rebuildFences,
  YARD,
} from './yard';

afterEach(() => {
  house.level = 1;
  rebuildFences();
  buildFencePieces();
});

describe('yardFor', () => {
  it('레벨 1 마당은 본부 둘레의 정해진 크기다', () => {
    expect(calculateYard(1)).toEqual({
      startX: HOUSE_X - 165,
      endX: HOUSE_X + 165,
      startY: HOUSE_Y - 180,
      endY: HOUSE_Y + 195,
    });
  });

  it('레벨이 오를 때마다 사방으로 넓어진다', () => {
    const [one, three] = [calculateYard(1), calculateYard(3)];
    expect(three.startX).toBe(one.startX - 120);
    expect(three.endX).toBe(one.endX + 120);
    expect(three.startY).toBe(one.startY - 80);
    expect(three.endY).toBe(one.endY + 40);
  });
});

describe('rebuildFences', () => {
  it('울타리는 위, 왼쪽, 오른쪽, 문 양옆 아래 다섯 선분이다', () => {
    expect(FENCES).toHaveLength(5);
    expect(FENCES[0]).toEqual([
      YARD.startX,
      YARD.startY,
      YARD.endX,
      YARD.startY,
    ]);
    expect(FENCES[3]).toEqual([
      YARD.startX,
      YARD.endY,
      HOUSE_X - 50,
      YARD.endY,
    ]);
    expect(FENCES[4]).toEqual([HOUSE_X + 50, YARD.endY, YARD.endX, YARD.endY]);
  });

  it('본부 레벨에 맞춰 마당을 다시 만든다', () => {
    house.level = 2;
    rebuildFences();
    expect(YARD).toEqual(calculateYard(2));
    expect(FENCES).toHaveLength(5);
  });
});

describe('buildFencePieces', () => {
  it('선분마다 간격에 맞는 개수의 조각을 놓는다', () => {
    const expected = FENCES.reduce((sum, [startX, startY, endX, endY]) => {
      const length = Math.hypot(endX - startX, endY - startY);
      return sum + Math.max(1, Math.round(length / FENCE_STEP));
    }, 0);
    expect(fencePieces).toHaveLength(expected);
  });

  it('위쪽 선분의 첫 조각은 구간 시작에서 반 칸 들어간 곳이고 방향은 -90도다', () => {
    const [x, y, angle] = fencePieces[0];
    const length = YARD.endX - YARD.startX;
    const segmentCount = Math.round(length / FENCE_STEP);
    expect(x).toBeCloseTo(YARD.startX + (length * 0.5) / segmentCount);
    expect(y).toBe(YARD.startY);
    expect(angle).toBeCloseTo(-Math.PI / 2);
  });

  it('다시 만들면 이전 조각을 지운다', () => {
    const before = fencePieces.length;
    buildFencePieces();
    expect(fencePieces).toHaveLength(before);
  });
});

describe('inYardArea', () => {
  const margin = { left: 10, right: 20, top: 30, bottom: 40 };

  it('마당 안은 항상 안이다', () => {
    expect(isInYardArea(HOUSE_X, HOUSE_Y, margin)).toBe(true);
  });

  it('마당 밖이라도 방향마다 정해진 여백 안이면 안이다', () => {
    expect(isInYardArea(YARD.startX - 5, HOUSE_Y, margin)).toBe(true);
    expect(isInYardArea(YARD.endX + 15, HOUSE_Y, margin)).toBe(true);
    expect(isInYardArea(HOUSE_X, YARD.startY - 25, margin)).toBe(true);
    expect(isInYardArea(HOUSE_X, YARD.endY + 35, margin)).toBe(true);
  });

  it('여백 밖은 밖이다', () => {
    expect(isInYardArea(YARD.startX - 15, HOUSE_Y, margin)).toBe(false);
    expect(isInYardArea(YARD.endX + 25, HOUSE_Y, margin)).toBe(false);
    expect(isInYardArea(HOUSE_X, YARD.startY - 35, margin)).toBe(false);
    expect(isInYardArea(HOUSE_X, YARD.endY + 45, margin)).toBe(false);
  });
});
