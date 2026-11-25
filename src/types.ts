import type { EnemyTier } from './enemyTiers';

export type Seconds = number;
export type Radians = number;
export type Point = { x: number; y: number };
export type Segment = [number, number, number, number];
export type FencePiece = [number, number, number];
export type PropEntry = [string, number, number];

export interface Worker {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  cooldown: Seconds;
  swing: Seconds;
  heading: Radians;
  walk: number;
  isMoving: boolean;
}

export interface Enemy {
  hp: number;
  maxHp: number;
  tier: EnemyTier;
  scale: number;
  speed: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  heading: Radians;
  jitter: number;
  spriteIndex: number;
  phase: number;
}

export interface Pellet {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  z: number;
  velocityZ: number;
  phase: number;
  age: Seconds;
}

export interface Tower {
  x: number;
  y: number;
  cooldown: Seconds;
  rate: number;
  range: number;
  blast: number;
  recoil: Seconds;
  heading: Radians;
  born: Seconds;
  level: number;
  damage: number;
  powerUpPaid: number;
}

export interface Spot {
  x: number;
  y: number;
  cost: number;
  paid: number;
  isBuilt: boolean;
  coinCharge: number;
  pulse: number;
  born: Seconds;
  isUpgrade?: boolean;
  tower?: Tower;
}

export interface Effect {
  x: number;
  y: number;
  age: Seconds;
  radius: number;
  isBuildEffect?: boolean;
}

export interface Shot {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  elapsed: Seconds;
  duration: Seconds;
  radius: number;
  isBig: boolean;
  damage: number;
}

export interface Fly {
  x: number;
  y: number;
  spot: Spot;
  elapsed: Seconds;
  duration: Seconds;
  phase: number;
}

// tilt: 땅을 위아래로 누르는 비율(작을수록 낮게 본다). rotationCos, rotationSin: 카메라 회전의 cos, sin
export interface Camera {
  x: number;
  y: number;
  zoom: number;
  rotation: Radians;
  tilt: number;
  panX: number;
  panY: number;
  rotationCos: number;
  rotationSin: number;
}

// manifest.json의 한 항목: 층 layerCount장을 가로 columns칸 격자에 놓은 PNG 한 장이다. 칸 하나는 textureSize x textureSize 픽셀이다
export interface SheetEntry {
  file: string;
  textureSize: number;
  columns: number;
  layerCount: number;
  lift: number;
  width: number;
  height: number;
}

export interface Built {
  canvas: HTMLCanvasElement;
  originX: number;
  originY: number;
}

// 층 그림 묶음. cache는 (각도, 카메라 높낮이) 단계별로 합친 그림이다
export interface Stack {
  layers: HTMLCanvasElement[];
  rims: HTMLCanvasElement[];
  layerCount: number;
  lift: number;
  width: number;
  height: number;
  cache: Map<number, Built>;
}

type WavePhase = 'break' | 'go';

export interface GameState {
  worker: Worker;
  coins: number;
  enemies: Enemy[];
  pellets: Pellet[];
  towers: Tower[];
  spots: Spot[];
  effects: Effect[];
  shots: Shot[];
  flies: Fly[];
  time: Seconds;
  hp: number;
  wave: number;
  phase: WavePhase;
  phaseTime: Seconds;
  toSpawn: number;
  spawnAccumulator: number;
  banner: Seconds;
  bannerText: string;
  pulse: number;
  houseBorn: Seconds;
  over: boolean;
}
