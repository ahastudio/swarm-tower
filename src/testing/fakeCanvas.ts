// 캔버스를 실제로 그리지 않고 호출만 기록하는 가짜 컨텍스트와 Path2D

export interface Call {
  name: string;
  callArguments: unknown[];
}

export interface FakeContext {
  context: CanvasRenderingContext2D;
  calls: Call[];
  props: Record<string, unknown>;
}

// 호출은 { name, args }로, 속성에 넣은 값은 { name: 'set:속성', args: [값] }으로 기록한다
export function createFakeContext(canvas?: HTMLCanvasElement): FakeContext {
  const calls: Call[] = [];
  const props: Record<string, unknown> = { canvas };
  const fakeContext = new Proxy({} as Record<string, unknown>, {
    get: (_target, name: string) => {
      if (name in props) {
        return props[name];
      }
      return (...callArguments: unknown[]) => {
        calls.push({ name, callArguments });
      };
    },
    set: (_target, name: string, value) => {
      props[name] = value;
      calls.push({ name: `set:${name}`, callArguments: [value] });
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  return { context: fakeContext, calls, props };
}

export class FakePath2D {
  calls: Call[] = [];

  private record(name: string, callArguments: unknown[]) {
    this.calls.push({ name, callArguments });
  }

  rect(...callArguments: unknown[]) {
    this.record('rect', callArguments);
  }

  moveTo(...callArguments: unknown[]) {
    this.record('moveTo', callArguments);
  }

  lineTo(...callArguments: unknown[]) {
    this.record('lineTo', callArguments);
  }

  closePath() {
    this.record('closePath', []);
  }
}

const contexts = new WeakMap<HTMLCanvasElement, FakeContext>();

// 캔버스마다 가짜 컨텍스트를 하나씩 돌려준다
export function findContext(canvas: HTMLCanvasElement) {
  const existing = contexts.get(canvas);
  if (existing) {
    return existing;
  }
  const created = createFakeContext(canvas);
  contexts.set(canvas, created);
  return created;
}

export function installCanvasFakes() {
  HTMLCanvasElement.prototype.getContext = function getContext(
    this: HTMLCanvasElement,
  ) {
    return findContext(this).context;
  } as unknown as HTMLCanvasElement['getContext'];
  globalThis.Path2D = FakePath2D as unknown as typeof Path2D;
}

export const listNames = (calls: Call[]) => calls.map((call) => call.name);
