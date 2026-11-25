import game from '../game';

const BANNER_SECONDS = 2.4;

export default function showBanner(text: string) {
  game.banner = BANNER_SECONDS;
  game.bannerText = text;
}
