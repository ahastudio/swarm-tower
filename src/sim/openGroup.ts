import { SPOT_GROUPS } from '../constants';
import game from '../game';
import { createSpot } from '../world/spots';

export default function openGroup(level: number) {
  for (const [x, y, cost] of SPOT_GROUPS[level]) {
    game.spots.push(createSpot({ x, y }, cost));
  }
}
