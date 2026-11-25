import { describe, expect, it } from 'vitest';
import { START } from '../constants';
import createWorker from './createWorker';

describe('createWorker', () => {
  it('출발점에 서서 가만히 있는 주인공을 만든다', () => {
    const worker = createWorker();
    expect([worker.x, worker.y]).toEqual([START.x, START.y]);
    expect([worker.targetX, worker.targetY]).toEqual([START.x, START.y]);
    expect(worker.isMoving).toBe(false);
    expect(worker.heading).toBe(0);
  });

  it('부를 때마다 새 객체를 만든다', () => {
    expect(createWorker()).not.toBe(createWorker());
  });
});
