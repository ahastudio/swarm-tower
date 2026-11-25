import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { spriteAssets } from '../sprites/assets';
import { installFakeAssets } from '../testing/fakeAssets';
import { makeRenderEnvironment, projectFoot } from '../testing/fakeEnv';
import { resetHouse } from '../testing/freshGame';
import house from '../world/house';
import { isInYardArea, rebuildFences } from '../world/yard';
import addProps from './addProps';
import propList from './propList';

beforeEach(installFakeAssets);

afterEach(resetHouse);

const margin = { left: 30, right: 30, top: 30, bottom: 60 };
const listOutsideYard = () =>
  propList.filter(([, x, y]) => !isInYardArea(x, y, margin));

describe('addProps', () => {
  it('처음 마당 밖의 꾸밈은 모두 놓는다', () => {
    const fake = makeRenderEnvironment();
    addProps(fake.environment);
    expect(fake.placed).toHaveLength(propList.length);
    expect(fake.placed[0].margin).toBe(120);
  });

  it('본부가 커져 마당이 넓어지면 마당 안(조금 넓혀서)의 꾸밈은 빼고 놓는다', () => {
    house.level = 5;
    rebuildFences();
    const fake = makeRenderEnvironment();
    addProps(fake.environment);
    expect(listOutsideYard().length).toBeLessThan(propList.length);
    expect(fake.placed).toHaveLength(listOutsideYard().length);
  });

  it('꾸밈마다 폭의 0.3배 그림자를 깔고 앞으로 향한 그림을 놓는다', () => {
    const fake = makeRenderEnvironment();
    addProps(fake.environment);
    const [name, x, y] = listOutsideYard()[0];
    const foot = projectFoot({ x, y });
    expect(fake.shadows[0]).toEqual([
      foot.x,
      foot.y,
      spriteAssets.props[name].width * 0.3,
    ]);
    expect(fake.stacks[0]).toEqual({
      stack: spriteAssets.props[name],
      placement: { angle: 0, x: foot.x, y: foot.y },
    });
  });
});
