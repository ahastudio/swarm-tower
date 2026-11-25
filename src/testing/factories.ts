import type { Effect, Enemy, Fly, Pellet, Shot, Spot, Tower } from '../types';

// 테스트에서 값 몇 개만 바꿔 쓰는 기본 객체들

export const makeEnemy = (over: Partial<Enemy> = {}): Enemy => ({
  hp: 3,
  maxHp: 3,
  tier: 0,
  scale: 1,
  speed: 60,
  x: 100,
  y: 100,
  velocityX: 0,
  velocityY: 0,
  heading: 0,
  jitter: 0,
  spriteIndex: 0,
  phase: 0,
  ...over,
});

export const makeTower = (over: Partial<Tower> = {}): Tower => ({
  x: 500,
  y: 500,
  cooldown: 0,
  rate: 1,
  range: 420,
  blast: 64,
  recoil: 0,
  heading: 0,
  born: 0,
  level: 1,
  damage: 1,
  powerUpPaid: 0,
  ...over,
});

export const makeSpot = (over: Partial<Spot> = {}): Spot => ({
  x: 500,
  y: 500,
  cost: 10,
  paid: 0,
  isBuilt: false,
  coinCharge: 0,
  pulse: 0,
  born: 0,
  ...over,
});

export const makePellet = (over: Partial<Pellet> = {}): Pellet => ({
  x: 800,
  y: 800,
  velocityX: 0,
  velocityY: 0,
  z: 6,
  velocityZ: 0,
  phase: 0,
  age: 1,
  ...over,
});

export const makeShot = (over: Partial<Shot> = {}): Shot => ({
  x: 0,
  y: 0,
  targetX: 100,
  targetY: 100,
  elapsed: 0,
  duration: 1,
  radius: 50,
  isBig: false,
  damage: 1,
  ...over,
});

export const makeFly = (spot: Spot, over: Partial<Fly> = {}): Fly => ({
  x: 0,
  y: 0,
  spot,
  elapsed: 0,
  duration: 0.34,
  phase: 0,
  ...over,
});

export const makeEffect = (over: Partial<Effect> = {}): Effect => ({
  x: 100,
  y: 100,
  age: 0,
  radius: 50,
  ...over,
});
