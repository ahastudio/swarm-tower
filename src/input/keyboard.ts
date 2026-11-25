// 지금 눌려 있는 키(소문자 이름)
export const keys: Record<string, boolean> = {};

export function installKeyboard() {
  addEventListener('keydown', (event) => {
    keys[event.key.toLowerCase()] = true;
  });
  addEventListener('keyup', (event) => {
    keys[event.key.toLowerCase()] = false;
  });
}
