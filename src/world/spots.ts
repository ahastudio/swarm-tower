import type { Point, Spot } from '../types';

export const createSpot = (point: Point, cost: number): Spot => ({
  x: point.x,
  y: point.y,
  cost,
  paid: 0,
  isBuilt: false,
  coinCharge: 0,
  pulse: 0,
  born: 0,
});

export const createUpgradeSpot = (point: Point, cost: number): Spot => ({
  ...createSpot(point, cost),
  isUpgrade: true,
});
