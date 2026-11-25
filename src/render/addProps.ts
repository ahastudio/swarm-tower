import { spriteAssets } from '../sprites/assets';
import type { Point, Stack } from '../types';
import { isInYardArea } from '../world/yard';
import propList from './propList';
import type { RenderEnvironment } from './scene';

const PROP_MARGIN = 120;
const SHADOW_RATIO = 0.3;
// 마당 안(조금 넓혀서)에는 꾸밈을 그리지 않는다
const YARD_MARGIN = { left: 30, right: 30, top: 30, bottom: 60 };

function drawProp(environment: RenderEnvironment, prop: Stack, foot: Point) {
  environment.shadow(foot, prop.width * SHADOW_RATIO);
  environment.stack(prop, { angle: 0, x: foot.x, y: foot.y });
}

export default function addProps(environment: RenderEnvironment) {
  for (const [name, x, y] of propList) {
    if (!isInYardArea(x, y, YARD_MARGIN)) {
      environment.place({ x, y }, PROP_MARGIN, (foot) =>
        drawProp(environment, spriteAssets.props[name], foot),
      );
    }
  }
}
