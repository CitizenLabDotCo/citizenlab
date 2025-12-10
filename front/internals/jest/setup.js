import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch';

Object.assign(global, { TextDecoder, TextEncoder });

// Parses pixel value from style string, ignoring percentage values.
// Returns NaN for non-pixel values (e.g. "100%", "auto").
function parsePixelValue(value) {
  if (!value || typeof value !== 'string') return NaN;
  if (value.endsWith('px')) return parseInt(value, 10);
  if (value.endsWith('%')) return NaN;
  const num = parseInt(value, 10);
  return value === String(num) ? num : NaN;
}

// Gets mock dimensions from element styles/attributes, walking up DOM tree.
// Needed because recharts 3.x relies on ResizeObserver and getBoundingClientRect
// for container dimensions, and JSDOM doesn't support real layout.
function getMockDimensions(element) {
  let width = parsePixelValue(element?.style?.width);
  let height = parsePixelValue(element?.style?.height);

  if (!(width > 0)) width = parsePixelValue(element?.getAttribute?.('width'));
  if (!(height > 0)) height = parsePixelValue(element?.getAttribute?.('height'));

  let parent = element?.parentElement;
  while (parent && (!(width > 0) || !(height > 0))) {
    if (!(width > 0)) {
      width =
        parsePixelValue(parent.style?.width) ||
        parsePixelValue(parent.getAttribute?.('width'));
    }
    if (!(height > 0)) {
      height =
        parsePixelValue(parent.style?.height) ||
        parsePixelValue(parent.getAttribute?.('height'));
    }
    parent = parent.parentElement;
  }

  return { width: width > 0 ? width : 400, height: height > 0 ? height : 200 };
}

Element.prototype.getBoundingClientRect = function () {
  const { width, height } = getMockDimensions(this);
  return { width, height, top: 0, left: 0, bottom: height, right: width, x: 0, y: 0, toJSON: () => ({}) };
};

global.ResizeObserver = class MockResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe(target) {
    const { width, height } = getMockDimensions(target);
    queueMicrotask(() => {
      this.callback([
        {
          target,
          contentRect: { width, height, top: 0, left: 0, bottom: height, right: width },
          borderBoxSize: [{ inlineSize: width, blockSize: height }],
          contentBoxSize: [{ inlineSize: width, blockSize: height }],
          devicePixelContentBoxSize: [{ inlineSize: width, blockSize: height }],
        },
      ]);
    });
  }

  unobserve() {}
  disconnect() {}
};

HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  globalAlpha: 1,
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: [] })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => []),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
}));
HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,');

jest.mock('polished');
jest.mock('quill-blot-formatter');
jest.mock('history', () => ({
  createBrowserHistory: () => ({
    replace: jest.fn(),
    length: 0,
    location: {
      pathname: '',
      search: '',
      state: '',
      hash: '',
    },
    action: 'REPLACE',
    push: jest.fn(),
    go: jest.fn(),
    goBack: jest.fn(),
    goForward: jest.fn(),
    block: jest.fn(),
    listen: jest.fn(),
    createHref: jest.fn(),
    parsePath: jest.fn(),
  }),
}));

jest.mock('utils/cl-router/Link');
jest.mock('utils/cl-router/history');
jest.mock('hooks/useLocale');
jest.mock('hooks/useLocalize');
jest.mock('utils/cl-intl');
jest.mock('utils/locale');
jest.mock('utils/localeStream');
jest.mock('api/app_configuration/useAppConfiguration');
jest.mock('modules');
jest.mock('js-confetti', () => jest.fn(() => ({ addConfetti: jest.fn() })));
