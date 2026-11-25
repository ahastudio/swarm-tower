import { beforeEach, expect, it, vi } from 'vitest';
import { mountGameDom } from '../testing/mountDom';
import { findById } from './domLookup';
import waitForStart from './waitForStart';

beforeEach(mountGameDom);

it('시작 버튼을 누를 때까지 기다리고 타이틀을 숨긴다', async () => {
  const started = vi.fn();
  const waiting = waitForStart().then(started);
  await Promise.resolve();
  expect(started).not.toHaveBeenCalled();
  expect(findById('title').hidden).toBe(false);
  findById('start').click();
  await waiting;
  expect(findById('title').hidden).toBe(true);
  expect(started).toHaveBeenCalledOnce();
  findById('title').hidden = false;
  findById('start').click();
  expect(findById('title').hidden).toBe(false);
});
