import { beforeEach, describe, expect, it } from 'vitest';
import game from '../game';
import { makeSpot } from '../testing/factories';
import { createFakeContext } from '../testing/fakeCanvas';
import { prepareFreshGame } from '../testing/freshGame';
import drawSpotPads from './drawSpotPads';

beforeEach(prepareFreshGame);

const draw = (...spots: ReturnType<typeof makeSpot>[]) => {
  game.spots = spots;
  const fake = createFakeContext();
  drawSpotPads(fake.context);
  return fake.calls;
};

const collectRects = (calls: ReturnType<typeof draw>, name: string) =>
  calls.filter((call) => call.name === name).map((call) => call.callArguments);
const collectStyles = (calls: ReturnType<typeof draw>, name: string) =>
  calls
    .filter((call) => call.name === `set:${name}`)
    .map((call) => call.callArguments[0]);

describe('drawSpotPads 짓는 판', () => {
  const spot = makeSpot({ x: 500, y: 600, cost: 10, paid: 5, born: 10 });

  it('아직 안 지은 판만 그리고 다 지은 판은 건너뛴다', () => {
    const calls = draw(makeSpot({ isBuilt: true }));
    expect(calls.filter((call) => call.name === 'fillRect')).toHaveLength(0);
    expect(
      draw(spot, makeSpot({ isBuilt: true })).filter(
        (call) => call.name === 'fillRect',
      ),
    ).toHaveLength(3);
  });

  it('그림자, 판 바닥, 낸 동전만큼 차오른 칸을 차례로 채운다', () => {
    const calls = draw(spot);
    expect(collectRects(calls, 'fillRect')).toEqual([
      [452, 552, 96, 96],
      [456, 556, 88, 88],
      [456, 600, 88, 44],
    ]);
    expect(collectStyles(calls, 'fillStyle')).toEqual([
      'rgba(60,70,40,.25)',
      '#fff3d6',
      '#ffc531',
    ]);
  });

  it('테두리 사각형과 점선 사각형을 긋는다', () => {
    const calls = draw(spot);
    expect(collectRects(calls, 'strokeRect')).toEqual([
      [459, 559, 82, 82],
      [468, 568, 64, 64],
    ]);
    expect(collectStyles(calls, 'strokeStyle')).toEqual(['#e7a23c', '#fffbe8']);
    expect(collectStyles(calls, 'lineWidth')).toEqual([6, 2]);
    expect(collectRects(calls, 'setLineDash')).toEqual([[[8, 8]], [[]]]);
  });

  it('저장하고 복원한다', () => {
    const calls = draw(spot);
    expect(calls[0].name).toBe('save');
    expect(calls.at(-1)?.name).toBe('restore');
  });

  it('나타난 직후에는 작게 시작해 0.35초 동안 커진다', () => {
    const calls = draw(makeSpot({ x: 500, y: 600, born: 0 }));
    const [shadow] = collectRects(calls, 'fillRect');
    expect(shadow[2]).toBeCloseTo(44 * 0.1 * 2 + 8);
    const grown = draw(makeSpot({ x: 500, y: 600, born: 0.35 }));
    expect(collectRects(grown, 'fillRect')[0][2]).toBe(96);
  });

  it('동전이 들어오면 잠깐 더 커지고 테두리가 하얗게 번쩍인다', () => {
    const calls = draw(makeSpot({ x: 500, y: 600, born: 10, pulse: 1 }));
    const [, face] = collectRects(calls, 'fillRect');
    expect(face[2]).toBeCloseTo(44 * 1.1 * 2);
    expect(collectStyles(calls, 'strokeStyle')[0]).toBe('#fff');
  });

  it('번쩍임이 약하면 원래 테두리색이다', () => {
    const calls = draw(makeSpot({ born: 10, pulse: 0.3 }));
    expect(collectStyles(calls, 'strokeStyle')[0]).toBe('#e7a23c');
  });
});

describe('drawSpotPads 본부 판', () => {
  it('본부를 키우는 판은 파란 색이다', () => {
    const calls = draw(
      makeSpot({ isUpgrade: true, born: 10, cost: 60, paid: 30 }),
    );
    expect(collectStyles(calls, 'fillStyle')).toEqual([
      'rgba(60,70,40,.25)',
      '#e3f1ff',
      '#6fb6ff',
    ]);
    expect(collectStyles(calls, 'strokeStyle')[0]).toBe('#3f8fe0');
  });
});
