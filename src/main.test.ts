import { beforeEach, describe, expect, it, vi } from 'vitest';

const log = vi.hoisted(() => [] as string[]);
const hooks = vi.hoisted(() => ({
  nextFrames: [] as (() => void)[],
  start: () => {},
}));

vi.mock('./ui/waitForStart', () => ({
  default: () =>
    new Promise<void>((resolve) => {
      log.push('waitForStart');
      hooks.start = resolve;
    }),
}));

vi.mock('./camera/view', () => ({
  initializeView: () => log.push('initView'),
}));
vi.mock('./input/installInput', () => ({
  default: () => log.push('installInput'),
}));
vi.mock('./ui/installRestart', () => ({
  default: () => log.push('installRestart'),
}));
vi.mock('./sprites/assets', () => ({
  loadAssets: async (onProgress: (ratio: number) => void) => {
    log.push('loadAssets');
    onProgress(0.5);
  },
}));
vi.mock('./ui/loading', () => ({
  setLoading: (percent: number, message: string) =>
    log.push(`setLoading(${percent}, ${message})`),
  nextFrame: async () => {
    log.push('nextFrame');
  },
  hideLoading: () => log.push('hideLoading'),
  showLoading: () => log.push('showLoading'),
}));
vi.mock('./resetGame', () => ({ default: () => log.push('resetGame') }));
vi.mock('./render/draw', () => ({ default: () => log.push('draw') }));
vi.mock('./sim/update', () => ({
  default: (deltaSeconds: number) => log.push(`update(${deltaSeconds})`),
}));
vi.mock('./ui/developerInformation', () => ({
  startDeveloperInformation: (now: number) =>
    log.push(`startDeveloperInformation(${now})`),
  tickDeveloperInformation: (now: number) =>
    log.push(`tickDeveloperInformation(${now})`),
}));
vi.mock('./installDebugHooks', () => ({
  default: () => log.push('installDebugHooks'),
}));

beforeEach(() => {
  log.length = 0;
  hooks.nextFrames.length = 0;
  vi.resetModules();
  vi.spyOn(performance, 'now').mockReturnValue(5000);
  vi.stubGlobal('requestAnimationFrame', (callback: () => void) =>
    hooks.nextFrames.push(callback),
  );
});

async function startGame() {
  const importing = import('./main');
  await vi.waitFor(() => expect(log).toEqual(['waitForStart']));
  hooks.start();
  await importing;
}

describe('main', () => {
  it('시작을 기다리는 동안 로딩과 게임 초기화를 하지 않는다', async () => {
    const importing = import('./main');
    await vi.waitFor(() => expect(log).toEqual(['waitForStart']));
    expect(hooks.nextFrames).toHaveLength(0);
    hooks.start();
    await importing;
  });
  it('화면과 입력을 준비하고 읽은 만큼 로딩 막대를 올리며 불러온다', async () => {
    await startGame();
    expect(log.slice(0, 11)).toEqual([
      'waitForStart',
      'showLoading',
      'initView',
      'installInput',
      'installRestart',
      'setLoading(5, 불러오는 중)',
      'nextFrame',
      'loadAssets',
      'setLoading(47.5, 불러오는 중)',
      'setLoading(90, 불러오는 중)',
      'nextFrame',
    ]);
  });

  it('새 게임을 만들고 첫 화면을 그린 뒤 로딩 화면을 숨기고 게임 루프를 시작한다', async () => {
    await startGame();
    expect(log.slice(11)).toEqual([
      'resetGame',
      'draw',
      'setLoading(100, 불러오는 중)',
      'nextFrame',
      'hideLoading',
      'startDeveloperInformation(5000)',
      'tickDeveloperInformation(5000)',
      'update(0)',
      'draw',
      'installDebugHooks',
    ]);
  });

  it('배포판에서는 개발용 훅을 켜지 않는다', async () => {
    vi.stubEnv('DEV', false);
    await startGame();
    expect(log.join()).not.toContain('installDebugHooks');
    vi.unstubAllEnvs();
  });

  it('다음 화면 갱신 때마다 걸린 시간만큼 갱신하고 그린다', async () => {
    await startGame();
    log.length = 0;
    hooks.nextFrames[0] = hooks.nextFrames[0] ?? (() => undefined);
    (hooks.nextFrames[0] as unknown as (now: number) => void)(5016);
    expect(log).toEqual([
      'tickDeveloperInformation(5016)',
      'update(0.016)',
      'draw',
    ]);
  });

  it('프레임이 너무 늦어져도 한 번에 0.05초까지만 갱신한다', async () => {
    await startGame();
    log.length = 0;
    (hooks.nextFrames[0] as unknown as (now: number) => void)(9000);
    expect(log[1]).toBe('update(0.05)');
  });
});
