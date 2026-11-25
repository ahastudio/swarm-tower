import type { Point, Radians } from '../types';

// pending: 아직 어떤 조작인지 모름, view: 줌과 회전, tilt: 높낮이
type GestureKind = 'pending' | 'view' | 'tilt';

// 두 손가락 조작. d: 두 손가락 사이 거리, a: 잇는 선의 각도, my: 가운데의 세로 위치. 숫자 뒤의 0은 처음 값이다
export interface Gesture {
  kind: GestureKind;
  startDistance: number;
  startAngle: Radians;
  startMiddleY: number;
  distance: number;
  angle: Radians;
  middleY: number;
}

export type Mode = 'none' | 'rotate' | 'pan' | 'move' | 'gesture';

interface PointerState {
  mode: Mode;
  lastX: number;
  lastY: number;
  gesture: Gesture;
  touches: Map<number, Point>;
}

// 포인터 입력의 현재 상태. mode는 지금 이어지는 조작이다
const pointerState: PointerState = {
  mode: 'none',
  lastX: 0,
  lastY: 0,
  gesture: {
    kind: 'pending',
    startDistance: 1,
    startAngle: 0,
    startMiddleY: 0,
    distance: 1,
    angle: 0,
    middleY: 0,
  },
  touches: new Map<number, Point>(),
};

export default pointerState;
