import { describe, expect, it, vi } from 'vitest';

// 마당이 가린다고 하면 어떤 꾸밈도 놓이지 않는다
vi.mock('../world/yard', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../world/yard')>()),
  isInYardArea: () => true,
}));

const { default: propList } = await import('./propList');

describe('propList 마당 안', () => {
  it('마당 안이면 흩뿌린 꾸밈도 숲도 꽃밭도 놓지 않는다', () => {
    expect(propList).toEqual([]);
  });
});
