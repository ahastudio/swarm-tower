import { describe, expect, it } from 'vitest';
import { findContext } from '../testing/fakeCanvas';
import type { Stack } from '../types';
import bakeStack, { calculateGap } from './bakeStack';

const stack = {
  layers: [{}, {}, {}] as HTMLCanvasElement[],
  rims: [{}, {}, {}] as HTMLCanvasElement[],
  layerCount: 3,
  lift: 4,
  width: 20,
  height: 20,
  cache: new Map(),
} as Stack;

describe('gapOf', () => {
  it('똑바로 내려다보면 간격이 1이고 낮출수록 벌어진다', () => {
    expect(calculateGap(1)).toBe(1);
    expect(calculateGap(0.5)).toBe(1.5);
  });
});

describe('bakeStack', () => {
  it('사방에 여유를 두고 층 높이만큼 큰 캔버스를 만든다', () => {
    const built = bakeStack(stack, { angle: 0, tilt: 1 });
    expect(built.canvas.width).toBe(30);
    expect(built.canvas.height).toBe(30 + 12);
  });

  it('카메라를 낮추면 층 사이가 벌어져 캔버스가 더 높다', () => {
    const built = bakeStack(stack, { angle: 0, tilt: 0.5 });
    expect(built.canvas.height).toBe(30 + 18);
  });

  it('발 위치는 아래쪽 여유만큼 위다', () => {
    const built = bakeStack(stack, { angle: 0, tilt: 1 });
    expect(built.originX).toBe(15);
    expect(built.originY).toBe(42 - 15);
  });

  it('도트가 뭉개지지 않게 층을 쌓는다', () => {
    const built = bakeStack(stack, { angle: 1, tilt: 1 });
    const { props, calls } = findContext(built.canvas);
    expect(props.imageSmoothingEnabled).toBe(false);
    expect(calls.filter((call) => call.name === 'drawImage')).toHaveLength(6);
    expect(calls.find((call) => call.name === 'rotate')?.callArguments).toEqual(
      [1],
    );
  });
});
