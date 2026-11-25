import { beforeEach, describe, expect, it } from 'vitest';
import game from '../game';
import { makeSpot } from '../testing/factories';
import { makeRenderEnvironment, projectFoot } from '../testing/fakeEnv';
import { prepareFreshGame } from '../testing/freshGame';
import addSpotPrices from './addSpotPrices';

beforeEach(prepareFreshGame);

const draw = (spots = [makeSpot({ x: 100, y: 200, cost: 15, paid: 4 })]) => {
  game.spots = spots;
  const fake = makeRenderEnvironment(2);
  addSpotPrices(fake.environment);
  return fake;
};

const collectTexts = (fake: ReturnType<typeof draw>) =>
  fake.calls
    .filter((call) => call.name === 'fillText')
    .map((call) => call.callArguments);

describe('addSpotPrices', () => {
  it('아직 안 지은 판만 화면 안에서 놓는다', () => {
    const fake = draw([makeSpot(), makeSpot({ isBuilt: true })]);
    expect(fake.placed).toHaveLength(1);
    expect(fake.placed[0].margin).toBe(80);
  });

  it('남은 동전 수를 키운 좌표계 안에서 보인다', () => {
    const fake = draw();
    const foot = projectFoot({ x: 100, y: 200 });
    expect(collectTexts(fake)).toEqual([['11', -10, 0]]);
    expect(
      fake.calls.find((call) => call.name === 'translate')?.callArguments,
    ).toEqual([foot.x, foot.y - 12]);
    expect(
      fake.calls.find((call) => call.name === 'scale')?.callArguments,
    ).toEqual([2, 2]);
  });

  it('동전이 막 들어왔으면 잠깐 커진다', () => {
    const fake = draw([makeSpot({ pulse: 1 })]);
    expect(
      fake.calls.find((call) => call.name === 'scale')?.callArguments,
    ).toEqual([2.6, 2.6]);
  });

  it('본부를 키우는 판에는 「본부」 글자를 더 보인다', () => {
    const fake = draw([makeSpot({ isUpgrade: true })]);
    expect(collectTexts(fake).map((callArguments) => callArguments[0])).toEqual(
      ['10', '본부'],
    );
  });

  it('타워 판에는 「본부」 글자가 없다', () => {
    expect(
      collectTexts(draw()).map((callArguments) => callArguments[0]),
    ).toEqual(['11']);
  });

  it('동전 그림을 오른쪽에 둔다', () => {
    const fake = draw();
    expect(
      fake.calls.find((call) => call.name === 'arc')?.callArguments,
    ).toEqual([22, 1, 11, 0, 7]);
  });
});
