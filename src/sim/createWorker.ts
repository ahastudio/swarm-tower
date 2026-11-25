import { START } from '../constants';
import type { Worker } from '../types';

export default function createWorker(): Worker {
  return {
    x: START.x,
    y: START.y,
    targetX: START.x,
    targetY: START.y,
    cooldown: 0,
    swing: 0,
    heading: 0,
    walk: 0,
    isMoving: false,
  };
}
