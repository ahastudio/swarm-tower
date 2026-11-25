import { beforeEach, describe, expect, it } from 'vitest';
import game from '../game';
import { makeEnemy } from '../testing/factories';
import { prepareFreshGame } from '../testing/freshGame';
import { mountGameDom } from '../testing/mountDom';
import updateStatusDisplay from './updateStatusDisplay';

beforeEach(() => {
  prepareFreshGame();
  mountGameDom();
});

const readText = (id: string) => document.getElementById(id)?.textContent;

describe('updateStatusDisplay 동전', () => {
  it('동전 수를 보인다', () => {
    game.coins = 42;
    updateStatusDisplay();
    expect(readText('coin-count')).toBe('42');
  });

  it('동전을 얻은 직후에는 커졌다가 줄어든다', () => {
    game.pulse = 1;
    updateStatusDisplay();
    expect(game.pulse).toBeCloseTo(0.94);
    expect(document.getElementById('coins')?.style.transform).toBe(
      `scale(${1 + 0.94 * 0.18})`,
    );
  });

  it('반짝임은 0 밑으로 내려가지 않는다', () => {
    game.pulse = 0.01;
    updateStatusDisplay();
    expect(game.pulse).toBe(0);
  });
});

describe('updateStatusDisplay 웨이브', () => {
  it('쉬는 시간에는 다음 웨이브까지 남은 초를 올림해서 보인다', () => {
    game.phase = 'break';
    game.wave = 2;
    game.phaseTime = 3.2;
    updateStatusDisplay();
    expect(readText('wave')).toBe('웨이브 3까지 4초');
  });

  it('남은 시간이 음수면 0초로 보인다', () => {
    game.phaseTime = -2;
    updateStatusDisplay();
    expect(readText('wave')).toBe('웨이브 1까지 0초');
  });

  it('몰려오는 중에는 남은 적을 보인다', () => {
    game.phase = 'go';
    game.wave = 4;
    game.toSpawn = 10;
    game.enemies.push(makeEnemy(), makeEnemy());
    updateStatusDisplay();
    expect(readText('wave')).toBe('웨이브 4 · 남은 적 12');
  });
});

describe('updateStatusDisplay 생존 시간', () => {
  it('게임이 시작된 뒤 흐른 시간을 분:초로 보인다', () => {
    game.time = 65.4;
    updateStatusDisplay();
    expect(readText('survival')).toBe('생존 시간 1:05');
  });

  it('시작 직후에는 0:00이다', () => {
    updateStatusDisplay();
    expect(readText('survival')).toBe('생존 시간 0:00');
  });
});
