import { afterEach } from 'vitest';
import { installCanvasFakes } from './fakeCanvas';

installCanvasFakes();

afterEach(() => {
  document.body.innerHTML = '';
});
