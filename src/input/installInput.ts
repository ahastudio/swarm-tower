import view from '../camera/view';
import { installKeyboard } from './keyboard';
import {
  onPointerDown,
  onPointerLift,
  onPointerMove,
  onWheel,
} from './pointerHandlers';

function installCanvasEvents() {
  const { canvas } = view;
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('wheel', onWheel, { passive: false });
}

// 입력: 왼쪽 이동, 오른쪽 드래그 회전, 가운데 드래그 이동, 휠 줌.
// 터치: 한 손가락은 탭으로 이동하고, 두 손가락은 지도 앱처럼 벌리고 오므리면 줌, 비틀면 회전, 함께 위아래로 밀면 높낮이다.
export default function installInput() {
  installCanvasEvents();
  addEventListener('pointerup', onPointerLift);
  addEventListener('pointercancel', onPointerLift);
  installKeyboard();
}
