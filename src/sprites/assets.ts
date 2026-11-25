import type { SheetEntry, Stack } from '../types';
import loadStack from './loadStack';

// 구워 둔 Sprite Stacking 층 그림(public/sprites)을 읽는다.
interface Assets {
  base: Stack;
  houses: Stack[];
  fence: Stack;
  gate: Stack;
  cannon: Stack;
  props: Record<string, Stack>;
  enemies: Stack[];
  manIdle: Stack;
  manWalk: Stack[];
  manThrow: Stack[];
}

type Manifest = {
  [K in keyof Assets]: Assets[K] extends Stack
    ? SheetEntry
    : Assets[K] extends Stack[]
      ? SheetEntry[]
      : Record<string, SheetEntry>;
};

const SPRITE_DIR = '/sprites/';
const MANIFEST_URL = `${SPRITE_DIR}manifest.json`;

// loadAssets가 끝나기 전에는 비어 있다
export const spriteAssets = {} as Assets;

type ProgressListener = (ratio: number) => void;

interface Loader {
  loadOne: (entry: SheetEntry) => Promise<Stack>;
  loadMany: (entries: SheetEntry[]) => Promise<Stack[]>;
}

const listEntries = (manifest: Manifest): SheetEntry[] => [
  manifest.base,
  manifest.fence,
  manifest.gate,
  manifest.cannon,
  manifest.manIdle,
  ...manifest.houses,
  ...manifest.enemies,
  ...manifest.manWalk,
  ...manifest.manThrow,
  ...Object.values(manifest.props),
];

// 층이 많은 시트일수록 읽는 데 오래 걸리므로 층 수를 무게로 해서 진행을 센다
function createLoader(
  manifest: Manifest,
  onProgress: ProgressListener,
): Loader {
  const total = listEntries(manifest).reduce(
    (sum, entry) => sum + entry.layerCount,
    0,
  );
  const progress = { done: 0 };
  const loadOne = async (entry: SheetEntry) => {
    const stack = await loadStack(SPRITE_DIR, entry);
    progress.done += entry.layerCount;
    onProgress(progress.done / total);
    return stack;
  };
  const loadMany = (entries: SheetEntry[]) => Promise.all(entries.map(loadOne));
  return { loadOne, loadMany };
}

// 꾸밈 그림은 이름으로 찾을 수 있게 이름과 함께 담는다
async function loadProps(manifest: Manifest, loader: Loader) {
  const names = Object.keys(manifest.props);
  const stacks = await loader.loadMany(
    names.map((name) => manifest.props[name]),
  );
  return Object.fromEntries(names.map((name, index) => [name, stacks[index]]));
}

async function loadAll(manifest: Manifest, loader: Loader): Promise<Assets> {
  const { loadOne, loadMany } = loader;
  const [
    base,
    fence,
    gate,
    cannon,
    manIdle,
    houses,
    enemies,
    manWalk,
    manThrow,
    props,
  ] = await Promise.all([
    loadOne(manifest.base),
    loadOne(manifest.fence),
    loadOne(manifest.gate),
    loadOne(manifest.cannon),
    loadOne(manifest.manIdle),
    loadMany(manifest.houses),
    loadMany(manifest.enemies),
    loadMany(manifest.manWalk),
    loadMany(manifest.manThrow),
    loadProps(manifest, loader),
  ]);
  return {
    base,
    fence,
    gate,
    cannon,
    manIdle,
    houses,
    enemies,
    manWalk,
    manThrow,
    props,
  };
}

export async function loadAssets(onProgress: ProgressListener) {
  const manifest: Manifest = await (await fetch(MANIFEST_URL)).json();
  const loader = createLoader(manifest, onProgress);
  Object.assign(spriteAssets, await loadAll(manifest, loader));
}
