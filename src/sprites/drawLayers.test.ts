import { describe, expect, it } from 'vitest';
import { createFakeContext, listNames } from '../testing/fakeCanvas';
import type { Stack } from '../types';
import drawLayers from './drawLayers';

const createImage = (name: string) =>
  ({ name }) as unknown as HTMLCanvasElement;

const stack = {
  layers: [createImage('color0'), createImage('color1')],
  rims: [createImage('rim0'), createImage('rim1')],
  layerCount: 2,
  lift: 3,
  width: 20,
  height: 10,
  cache: new Map(),
} as Stack;

describe('drawLayers', () => {
  const pose = { x: 100, y: 200, scale: 2, angle: 0.5, squash: 0.6, gap: 1.4 };

  it('윤곽 층을 먼저 모두 깔고 색 층을 쌓는다', () => {
    const { context, calls } = createFakeContext();
    drawLayers(context, stack, pose);
    const drawn = calls
      .filter((call) => call.name === 'drawImage')
      .map((call) => (call.callArguments[0] as { name: string }).name);
    expect(drawn).toEqual(['rim0', 'rim1', 'color0', 'color1']);
  });

  it('층마다 저장하고 옮기고 늘리고 돌려 그린 뒤 복원한다', () => {
    const { context, calls } = createFakeContext();
    drawLayers(context, stack, pose);
    expect(listNames(calls).slice(0, 6)).toEqual([
      'save',
      'translate',
      'scale',
      'rotate',
      'drawImage',
      'restore',
    ]);
  });

  it('위 층일수록 층 높이 x 간격 x 배율만큼 위로 올린다', () => {
    const { context, calls } = createFakeContext();
    drawLayers(context, stack, pose);
    const moves = calls
      .filter((call) => call.name === 'translate')
      .map((call) => call.callArguments);
    expect(moves[0]).toEqual([100, 200]);
    expect(moves[1]).toEqual([100, 200 - 1 * 3 * 1.4 * 2]);
  });

  it('배율과 위아래 누름을 적용한다', () => {
    const { context, calls } = createFakeContext();
    drawLayers(context, stack, pose);
    const scale = calls.find((call) => call.name === 'scale');
    expect(scale?.callArguments).toEqual([2, 2 * 0.6]);
    expect(calls.find((call) => call.name === 'rotate')?.callArguments).toEqual(
      [0.5],
    );
  });

  it('그림은 가운데가 원점이 되도록 그린다', () => {
    const { context, calls } = createFakeContext();
    drawLayers(context, stack, pose);
    const draw = calls.find((call) => call.name === 'drawImage');
    expect(draw?.callArguments.slice(1)).toEqual([-10, -5, 20, 10]);
  });
});
