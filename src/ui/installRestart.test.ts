import { beforeEach, describe, expect, it } from 'vitest';
import game from '../game';
import { prepareFreshGame } from '../testing/freshGame';
import { mountGameDom } from '../testing/mountDom';
import house from '../world/house';
import { findById } from './domLookup';
import installRestart from './installRestart';

beforeEach(() => {
  prepareFreshGame();
  mountGameDom();
  installRestart();
  game.over = true;
  game.coins = 50;
  house.level = 3;
  findById('over').style.display = 'flex';
});

const readOverlayDisplay = () => document.getElementById('over')?.style.display;

describe('installRestart', () => {
  it('다시 시작 버튼을 누르면 새 게임이 시작된다', () => {
    document.getElementById('again')?.click();
    expect(game.over).toBe(false);
    expect(readOverlayDisplay()).toBe('none');
    expect(game.coins).toBe(0);
    expect(house.level).toBe(1);
  });

  it('Enter와 스페이스로도 다시 시작한다', () => {
    dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(game.over).toBe(false);
    game.over = true;
    dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    expect(game.over).toBe(false);
  });

  it('다른 키는 무시한다', () => {
    dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(game.over).toBe(true);
    expect(game.coins).toBe(50);
  });

  it('게임이 끝나지 않았으면 눌러도 아무 일이 없다', () => {
    game.over = false;
    document.getElementById('again')?.click();
    expect(game.coins).toBe(50);
    expect(house.level).toBe(3);
  });
});
