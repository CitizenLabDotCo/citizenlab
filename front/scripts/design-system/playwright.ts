// Playwright is not a repo dependency. Point GV_PLAYWRIGHT_DIR at a directory
// that contains node_modules/playwright, or install playwright so that a
// normal require resolves it. Browsers come from PLAYWRIGHT_BROWSERS_PATH.
import { createRequire } from 'module';
import path from 'path';

// Playwright, or undefined when it cannot be resolved.
export const tryLoadPlaywright = () => {
  const dir = process.env.GV_PLAYWRIGHT_DIR;
  const tries = [
    () => createRequire(path.join(dir as string, 'noop.js'))('playwright'),
    () => require('playwright'),
  ];
  for (const t of dir ? tries : tries.slice(1)) {
    try {
      return t();
    } catch {
      // try the next resolution
    }
  }
  return undefined;
};

export const loadPlaywright = () => {
  const pw = tryLoadPlaywright();
  if (pw) return pw;
  console.error(
    'Playwright not found. Set GV_PLAYWRIGHT_DIR to a directory containing node_modules/playwright (and PLAYWRIGHT_BROWSERS_PATH to its browsers), or install playwright.'
  );
  process.exit(2);
};
