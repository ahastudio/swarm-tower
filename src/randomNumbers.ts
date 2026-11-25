const MULTIPLIER = 16807;
const MODULUS = 2147483647;

// 시드를 정해 같은 순서로 같은 값이 나오는 난수. 땅 그림, 숲 배치, 웨이브가 매번 같아진다.
export const randomState = { seed: 7 };

export function nextRandom() {
  randomState.seed = (randomState.seed * MULTIPLIER) % MODULUS;
  return randomState.seed / MODULUS;
}

export function withSeed<T>(seed: number, build: () => T): T {
  const saved = randomState.seed;
  randomState.seed = seed;
  const result = build();
  randomState.seed = saved;
  return result;
}
