import { describe, expect, it } from 'vitest';
import { createFakeContext } from '../testing/fakeCanvas';
import drawOutlinedText from './drawOutlinedText';

describe('drawOutlinedText', () => {
  it('가운데 정렬로 윤곽을 먼저 긋고 그 위에 채운다', () => {
    const { context, calls } = createFakeContext();
    drawOutlinedText(context, '안녕', {
      x: 10,
      y: 20,
      font: 'bold 20px sans-serif',
      lineWidth: 5,
      stroke: '#000',
      fill: '#fff',
    });
    expect(calls).toEqual([
      { name: 'set:font', callArguments: ['bold 20px sans-serif'] },
      { name: 'set:textAlign', callArguments: ['center'] },
      { name: 'set:textBaseline', callArguments: ['middle'] },
      { name: 'set:lineWidth', callArguments: [5] },
      { name: 'set:lineJoin', callArguments: ['round'] },
      { name: 'set:strokeStyle', callArguments: ['#000'] },
      { name: 'strokeText', callArguments: ['안녕', 10, 20] },
      { name: 'set:fillStyle', callArguments: ['#fff'] },
      { name: 'fillText', callArguments: ['안녕', 10, 20] },
    ]);
  });
});
