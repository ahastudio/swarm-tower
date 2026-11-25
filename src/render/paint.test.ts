import { describe, expect, it } from 'vitest';
import {
  createFakeContext,
  FakePath2D,
  listNames,
} from '../testing/fakeCanvas';
import {
  drawCoinIcon,
  fillCircle,
  fillEllipse,
  fillPolygon,
  fillRect,
  strokeCircle,
  strokeEllipse,
  strokeSegments,
  withRotation,
  withScaleAbout,
  withTransform,
} from './paint';

describe('fill 도형', () => {
  it('타원은 색을 정하고 경로를 만들어 채운다', () => {
    const { context, calls } = createFakeContext();
    fillEllipse(context, '#123', { x: 1, y: 2, radiusX: 3, radiusY: 4 });
    expect(calls).toEqual([
      { name: 'set:fillStyle', callArguments: ['#123'] },
      { name: 'beginPath', callArguments: [] },
      { name: 'ellipse', callArguments: [1, 2, 3, 4, 0, 0, 7] },
      { name: 'fill', callArguments: [] },
    ]);
  });

  it('원은 한 바퀴 호를 채운다', () => {
    const { context, calls } = createFakeContext();
    fillCircle(context, '#456', { x: 5, y: 6, radius: 7 });
    expect(calls.map((call) => call.name)).toEqual([
      'set:fillStyle',
      'beginPath',
      'arc',
      'fill',
    ]);
    expect(calls[2].callArguments).toEqual([5, 6, 7, 0, 7]);
  });

  it('사각형은 색을 정하고 채운다', () => {
    const { context, calls } = createFakeContext();
    fillRect(context, '#789', { x: 1, y: 2, width: 3, height: 4 });
    expect(calls).toEqual([
      { name: 'set:fillStyle', callArguments: ['#789'] },
      { name: 'fillRect', callArguments: [1, 2, 3, 4] },
    ]);
  });

  it('다각형은 경로로 이어 채운다', () => {
    const { context, calls } = createFakeContext();
    fillPolygon(context, '#abc', [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ]);
    expect(listNames(calls)).toEqual([
      'set:fillStyle',
      'beginPath',
      'moveTo',
      'lineTo',
      'lineTo',
      'closePath',
      'fill',
    ]);
  });
});

describe('stroke 도형', () => {
  const pen = { color: '#f00', width: 3 };

  it('타원은 펜을 정하고 선을 긋는다', () => {
    const { context, calls } = createFakeContext();
    strokeEllipse(context, pen, { x: 1, y: 2, radiusX: 3, radiusY: 4 });
    expect(calls).toEqual([
      { name: 'set:strokeStyle', callArguments: ['#f00'] },
      { name: 'set:lineWidth', callArguments: [3] },
      { name: 'beginPath', callArguments: [] },
      { name: 'ellipse', callArguments: [1, 2, 3, 4, 0, 0, 7] },
      { name: 'stroke', callArguments: [] },
    ]);
  });

  it('원은 호를 긋는다', () => {
    const { context, calls } = createFakeContext();
    strokeCircle(context, pen, { x: 1, y: 2, radius: 3 });
    expect(listNames(calls)).toEqual([
      'set:strokeStyle',
      'set:lineWidth',
      'beginPath',
      'arc',
      'stroke',
    ]);
  });

  it('선분들은 한 경로로 모아 한 번에 긋는다', () => {
    const { context, calls } = createFakeContext();
    strokeSegments(context, pen, [
      [0, 0, 1, 1],
      [2, 2, 3, 3],
    ]);
    expect(listNames(calls)).toEqual([
      'set:strokeStyle',
      'set:lineWidth',
      'beginPath',
      'moveTo',
      'lineTo',
      'moveTo',
      'lineTo',
      'stroke',
    ]);
    expect(calls[5].callArguments).toEqual([2, 2]);
  });
});

describe('coinIcon', () => {
  it('노란 원을 채우고 같은 경로에 갈색 테두리를 두른다', () => {
    const { context, calls } = createFakeContext();
    drawCoinIcon(context, { x: 1, y: 2, radius: 3 }, 2);
    expect(listNames(calls)).toEqual([
      'set:fillStyle',
      'beginPath',
      'arc',
      'fill',
      'set:strokeStyle',
      'set:lineWidth',
      'stroke',
    ]);
    expect(calls[0].callArguments).toEqual(['#ffc531']);
    expect(calls[4].callArguments).toEqual(['#8a5a12']);
    expect(calls[5].callArguments).toEqual([2]);
  });
});

describe('좌표계를 바꿔 그리기', () => {
  it('withTransform은 옮기고 키워서 그린 뒤 복원한다', () => {
    const { context, calls } = createFakeContext();
    withTransform(context, { x: 10, y: 20, scale: 2 }, () => context.fill());
    expect(calls).toEqual([
      { name: 'save', callArguments: [] },
      { name: 'translate', callArguments: [10, 20] },
      { name: 'scale', callArguments: [2, 2] },
      { name: 'fill', callArguments: [] },
      { name: 'restore', callArguments: [] },
    ]);
  });

  it('withRotation은 옮기고 돌려서 그린 뒤 복원한다', () => {
    const { context, calls } = createFakeContext();
    withRotation(context, { x: 1, y: 2, angle: 0.5 }, () => context.fill());
    expect(listNames(calls)).toEqual([
      'save',
      'translate',
      'rotate',
      'fill',
      'restore',
    ]);
    expect(calls[2].callArguments).toEqual([0.5]);
  });

  it('withScaleAbout은 중심을 기준으로 키운다', () => {
    const { context, calls } = createFakeContext();
    withScaleAbout(context, { x: 10, y: 20, scale: 3 }, () => context.fill());
    expect(calls).toEqual([
      { name: 'save', callArguments: [] },
      { name: 'translate', callArguments: [10, 20] },
      { name: 'scale', callArguments: [3, 3] },
      { name: 'translate', callArguments: [-10, -20] },
      { name: 'fill', callArguments: [] },
      { name: 'restore', callArguments: [] },
    ]);
  });
});

describe('FakePath2D', () => {
  it('호출을 기록한다', () => {
    const path = new FakePath2D();
    path.rect(1, 2, 3, 4);
    expect(path.calls).toEqual([{ name: 'rect', callArguments: [1, 2, 3, 4] }]);
  });
});
