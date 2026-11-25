import { beforeEach, describe, expect, it } from 'vitest';
import game from '../game';
import { prepareFreshGame } from '../testing/freshGame';
import { mountGameDom } from '../testing/mountDom';
import showGameOver from './showGameOver';

beforeEach(() => {
  prepareFreshGame();
  mountGameDom();
});

describe('gameOver', () => {
  it('게임을 멈추고 생존 시간과 몇 웨이브까지 버텼는지 보인다', () => {
    game.wave = 5;
    game.time = 125.7;
    showGameOver();
    expect(game.over).toBe(true);
    expect(document.getElementById('survival-result')?.textContent).toBe(
      '생존 시간 2:05',
    );
    expect(document.getElementById('game-over-message')?.textContent).toBe(
      '웨이브 5까지 버텼습니다',
    );
    expect(document.getElementById('over')?.style.display).toBe('flex');
  });
});
