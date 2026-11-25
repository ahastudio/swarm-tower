// 적의 단계. 배열(크기, 속도, 체력, 동전)의 번호로도 쓴다
export const ENEMY_TIER = { weak: 0, strong: 1, elite: 2 } as const;

export type EnemyTier = (typeof ENEMY_TIER)[keyof typeof ENEMY_TIER];
