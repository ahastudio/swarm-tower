import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HOUSE_X, HOUSE_Y, PONDS } from '../constants';
import { FENCES } from '../world/yard';

// 층은 x를 100으로 나눈 값으로 정한다
const levels = vi.hoisted(() => ({ getLevelAt: vi.fn() }));
vi.mock('../world/terrainQueries', () => levels);

const { default: isMoveBlocked } = await import('./isMoveBlocked');

const open = { x: HOUSE_X, y: HOUSE_Y + 600 };

beforeEach(() => {
  levels.getLevelAt.mockImplementation((x: number) => Math.floor(x / 100));
});

describe('isMoveBlocked 땅', () => {
  it('섬 밖으로는 못 간다', () => {
    expect(isMoveBlocked(open, { x: 0, y: 0 })).toBe(true);
  });

  it('울타리 위로는 못 간다', () => {
    const [startX, startY] = FENCES[0];
    expect(
      isMoveBlocked(
        { x: startX + 50, y: startY - 60 },
        { x: startX + 50, y: startY },
      ),
    ).toBe(true);
  });

  it('연못 속으로는 못 간다', () => {
    const [panX, panY] = PONDS[0];
    expect(
      isMoveBlocked({ x: panX + 400, y: panY }, { x: panX, y: panY }),
    ).toBe(true);
  });

  it('열린 땅은 갈 수 있다', () => {
    levels.getLevelAt.mockReturnValue(1);
    expect(isMoveBlocked(open, { x: open.x + 5, y: open.y })).toBe(false);
  });
});

describe('isMoveBlocked 높낮이', () => {
  const start = { x: 2150, y: 2000 };

  it('제자리 걸음은 높이를 보지 않는다', () => {
    levels.getLevelAt.mockImplementation(() => {
      throw new Error('높이를 읽으면 안 된다');
    });
    expect(isMoveBlocked(start, start)).toBe(false);
  });

  it('한 층씩 오르는 비탈은 간다', () => {
    levels.getLevelAt.mockImplementation((x: number) => Math.floor(x / 30));
    expect(isMoveBlocked(start, { x: start.x + 10, y: start.y })).toBe(false);
  });

  it('도착점이 세 층 이상 높으면 못 간다', () => {
    levels.getLevelAt.mockImplementation((x: number) => (x > 2155 ? 3 : 0));
    expect(isMoveBlocked(start, { x: start.x + 10, y: start.y })).toBe(true);
  });

  it('도착점은 괜찮아도 바로 앞 24px에서 세 층 이상 솟으면 못 간다', () => {
    levels.getLevelAt.mockImplementation((x: number) => (x > 2170 ? 3 : 0));
    expect(isMoveBlocked(start, { x: start.x + 10, y: start.y })).toBe(true);
  });

  it('세 층 이상 꺼지는 곳도 못 간다', () => {
    levels.getLevelAt.mockImplementation((x: number) => (x > 2155 ? 0 : 4));
    expect(isMoveBlocked(start, { x: start.x + 10, y: start.y })).toBe(true);
  });
});
