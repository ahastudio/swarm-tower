import camera from '../camera/camera';
import { MAP_HEIGHT, MAP_WIDTH } from '../constants';
import game from '../game';
import { keys } from '../input/keyboard';
import { calculateHeading, clamp } from '../mathHelpers';
import type { Point, Seconds } from '../types';
import isMoveBlocked from './isMoveBlocked';

const EDGE = 20;
const SPEED = 190;
const ARRIVED = 4;
const WALK_CYCLE = 9;
const KEY_REACH = 40;
const CAMERA_FOLLOW = 4;
const LEFT_KEYS = ['a', 'arrowleft'];
const RIGHT_KEYS = ['d', 'arrowright'];
const UP_KEYS = ['w', 'arrowup'];
const DOWN_KEYS = ['s', 'arrowdown'];

const isPressed = (names: string[]) => names.some((name) => keys[name]);
const readAxis = (negative: string[], positive: string[]) =>
  Number(isPressed(positive)) - Number(isPressed(negative));

function readKeyDirection(): Point | null {
  const [inputX, inputY] = [
    readAxis(LEFT_KEYS, RIGHT_KEYS),
    readAxis(UP_KEYS, DOWN_KEYS),
  ];
  if (inputX === 0 && inputY === 0) {
    return null;
  }
  const length = Math.hypot(inputX, inputY);
  return { x: inputX / length, y: inputY / length };
}

// 방향키는 화면 기준으로 움직이므로 카메라 회전만큼 돌려 목표로 삼는다
function applyKeyboard() {
  const direction = readKeyDirection();
  if (direction) {
    game.worker.targetX =
      game.worker.x +
      (direction.x * camera.rotationCos + direction.y * camera.rotationSin) *
        KEY_REACH;
    game.worker.targetY =
      game.worker.y +
      (-direction.x * camera.rotationSin + direction.y * camera.rotationCos) *
        KEY_REACH;
  }
}

function stepToward(delta: Point, distance: number, deltaSeconds: Seconds) {
  const step = Math.min(distance, SPEED * deltaSeconds);
  game.worker.x += (delta.x / distance) * step;
  game.worker.y += (delta.y / distance) * step;
  game.worker.heading = calculateHeading(delta.x, delta.y);
  game.worker.walk += deltaSeconds * WALK_CYCLE;
}

function walkToTarget(deltaSeconds: Seconds) {
  const delta = {
    x: game.worker.targetX - game.worker.x,
    y: game.worker.targetY - game.worker.y,
  };
  const distance = Math.hypot(delta.x, delta.y);
  game.worker.isMoving = distance > ARRIVED;
  if (game.worker.isMoving) {
    stepToward(delta, distance, deltaSeconds);
  }
}

function clampToMap() {
  game.worker.x = clamp(game.worker.x, EDGE, MAP_WIDTH - EDGE);
  game.worker.y = clamp(game.worker.y, EDGE, MAP_HEIGHT - EDGE);
}

function slideFrom(start: Point) {
  const goal = { x: game.worker.x, y: game.worker.y };
  const candidates = [
    goal,
    { x: goal.x, y: start.y },
    { x: start.x, y: goal.y },
  ];
  const open = candidates.find((spot) => !isMoveBlocked(start, spot));
  Object.assign(game.worker, open ?? start);
}

// 카메라는 주인공을 부드럽게 따라가고(스크롤), 가운데 버튼으로 옮긴 만큼 벗어나 있다
function followWithCamera(deltaSeconds: Seconds) {
  const followFraction = Math.min(1, CAMERA_FOLLOW * deltaSeconds);
  camera.x += (game.worker.x - camera.x) * followFraction;
  camera.y += (game.worker.y - camera.y) * followFraction;
}

function walk(deltaSeconds: Seconds) {
  walkToTarget(deltaSeconds);
  clampToMap();
}

export default function moveWorker(deltaSeconds: Seconds) {
  applyKeyboard();
  const start = { x: game.worker.x, y: game.worker.y };
  walk(deltaSeconds);
  slideFrom(start);
  followWithCamera(deltaSeconds);
}
