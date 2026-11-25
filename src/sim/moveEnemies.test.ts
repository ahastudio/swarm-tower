import { beforeEach, describe, expect, it, vi } from 'vitest';
import game from '../game';
import { calculateHeading } from '../mathHelpers';
import { makeEnemy } from '../testing/factories';
import { prepareFreshGame } from '../testing/freshGame';
import house from '../world/house';

// 칸 번호: 왼쪽 위 0, 오른쪽 위 1, 왼쪽 아래 2, 오른쪽 아래 3 (경계는 100)
const grid = vi.hoisted(() => ({
  blocked: new Uint8Array(4),
  flowX: new Float32Array(4),
  flowY: new Float32Array(4),
  getCellIndex: (x: number, y: number) =>
    (x >= 100 ? 1 : 0) + (y >= 100 ? 2 : 0),
  buildFlow: () => undefined,
}));
vi.mock('../world/flow', () => grid);

const { default: moveEnemies } = await import('./moveEnemies');

beforeEach(() => {
  prepareFreshGame();
  grid.blocked.fill(0);
  grid.flowX.fill(0);
  grid.flowY.fill(0);
});

describe('moveEnemies', () => {
  it('본부에 닿은 적은 본부 체력을 1 깎고 사라진다', () => {
    const hp = game.hp;
    game.enemies.push(makeEnemy({ x: house.x + 60, y: house.y }));
    moveEnemies(0.1);
    expect(game.enemies).toHaveLength(0);
    expect(game.hp).toBe(hp - 1);
  });

  it('본부 근처 밖에서는 흐름 벡터를 따라 걷는다', () => {
    grid.flowX[0] = 1;
    const enemy = makeEnemy({ x: 10, y: 10, speed: 60 });
    game.enemies.push(enemy);
    moveEnemies(0.5);
    expect(enemy.velocityX).toBeCloseTo(60);
    expect(enemy.velocityY).toBeCloseTo(0);
    expect(enemy.x).toBeCloseTo(40);
    expect(enemy.y).toBeCloseTo(10);
    expect(enemy.heading).toBeCloseTo(calculateHeading(60, 0));
  });

  it('흩어짐(jit)만큼 방향을 틀되 속력은 그대로다', () => {
    grid.flowX[0] = 1;
    const enemy = makeEnemy({ x: 10, y: 10, speed: 50, jitter: 0.5 });
    game.enemies.push(enemy);
    moveEnemies(0.1);
    expect(Math.hypot(enemy.velocityX, enemy.velocityY)).toBeCloseTo(50);
    expect(enemy.velocityY).toBeGreaterThan(0);
  });

  it('흐름이 없는 칸에서는 제자리에 선다', () => {
    const enemy = makeEnemy({ x: 10, y: 10 });
    game.enemies.push(enemy);
    moveEnemies(0.5);
    expect([enemy.x, enemy.y]).toEqual([10, 10]);
  });

  describe('막힌 칸을 만났을 때', () => {
    // (90, 90)에서 (111, 111)로 가려 한다
    const walkDiagonally = () => {
      grid.flowX[0] = 1;
      grid.flowY[0] = 1;
      const enemy = makeEnemy({ x: 90, y: 90, speed: 300 });
      game.enemies.push(enemy);
      moveEnemies(0.1);
      return enemy;
    };

    it('가로로는 갈 수 있으면 가로로만 미끄러진다', () => {
      grid.blocked[3] = 1;
      const enemy = walkDiagonally();
      expect(enemy.y).toBe(90);
      expect(enemy.x).toBeCloseTo(90 + 300 * 0.1 * Math.SQRT1_2);
    });

    it('가로가 막혔고 세로로는 갈 수 있으면 세로로만 미끄러진다', () => {
      grid.blocked[3] = 1;
      grid.blocked[1] = 1;
      const enemy = walkDiagonally();
      expect(enemy.x).toBe(90);
      expect(enemy.y).toBeCloseTo(90 + 300 * 0.1 * Math.SQRT1_2);
    });

    it('두 방향 모두 막히면 제자리에 선다', () => {
      grid.blocked.fill(1);
      grid.blocked[0] = 0;
      const enemy = walkDiagonally();
      expect([enemy.x, enemy.y]).toEqual([90, 90]);
    });
  });
});
