import { findById } from './domLookup';

export default function waitForStart() {
  return new Promise<void>((resolve) => {
    findById('start').addEventListener(
      'click',
      () => {
        findById('title').hidden = true;
        resolve();
      },
      { once: true },
    );
  });
}
