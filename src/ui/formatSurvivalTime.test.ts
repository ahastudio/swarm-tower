import { describe, expect, it } from 'vitest';
import formatSurvivalTime from './formatSurvivalTime';

describe('formatSurvivalTime', () => {
  it('처음에는 0:00이다', () => {
    expect(formatSurvivalTime(0)).toBe('0:00');
  });

  it('초는 두 자리로 맞추고 소수는 버린다', () => {
    expect(formatSurvivalTime(5.9)).toBe('0:05');
    expect(formatSurvivalTime(59.99)).toBe('0:59');
  });

  it('60초가 되면 분이 오른다', () => {
    expect(formatSurvivalTime(60)).toBe('1:00');
    expect(formatSurvivalTime(125)).toBe('2:05');
  });

  it('한 시간이 넘어도 분으로 센다', () => {
    expect(formatSurvivalTime(3725)).toBe('62:05');
  });
});
