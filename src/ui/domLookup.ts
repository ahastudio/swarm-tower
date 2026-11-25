// 있어야 하는 DOM 요소를 id로 찾는다. 없으면 index.html이 어긋난 것이라 바로 알린다
export function findById(id: string) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`#${id} 요소가 없습니다`);
  }
  return element;
}

export function select(selector: string) {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) {
    throw new Error(`${selector} 요소가 없습니다`);
  }
  return element;
}
