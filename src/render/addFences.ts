import { spriteAssets } from '../sprites/assets';
import { fencePieces } from '../world/yard';
import type { RenderEnvironment } from './scene';

const FENCE_MARGIN = 80;

export default function addFences(environment: RenderEnvironment) {
  for (const [x, y, angle] of fencePieces) {
    environment.place({ x, y }, FENCE_MARGIN, (foot) =>
      environment.stack(spriteAssets.fence, { angle, x: foot.x, y: foot.y }),
    );
  }
}
