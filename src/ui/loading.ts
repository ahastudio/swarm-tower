import { findById, select } from './domLookup';

const FADE_MILLISECONDS = 450;

export function showLoading() {
  findById('loading').hidden = false;
}

export function setLoading(percent: number, message: string) {
  select('#loading-bar i').style.width = `${percent}%`;
  findById('loading-message').textContent = message;
}

export const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

export function hideLoading() {
  const loading = findById('loading');
  loading.style.opacity = '0';
  setTimeout(() => loading.remove(), FADE_MILLISECONDS);
}
