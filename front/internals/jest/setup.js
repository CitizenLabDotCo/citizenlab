import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch';

Object.assign(global, { TextDecoder, TextEncoder });

// Mock ResizeObserver to work in JSDOM (which has no layout engine).
// Parses width/height from element styles/attributes.
function parsePixelValue(value) {
  if (!value || typeof value !== 'string') return NaN;
  if (value.endsWith('px')) return parseInt(value, 10);
  if (value.endsWith('%')) return NaN;
  const num = parseInt(value, 10);
  return value === String(num) ? num : NaN;
}

function getMockDimensions(element) {
  let width = parsePixelValue(
    element?.getAttribute('style')?.match(/width:\s*(\d+px)/)?.[1]
  );
  let height = parsePixelValue(
    element?.getAttribute('style')?.match(/height:\s*(\d+px)/)?.[1]
  );

  if (!(width > 0)) width = parsePixelValue(element?.getAttribute('width'));
  if (!(height > 0)) height = parsePixelValue(element?.getAttribute('height'));

  let parent = element?.parentElement;
  while (parent && (!(width > 0) || !(height > 0))) {
    if (!(width > 0)) {
      width =
        parsePixelValue(
          parent.getAttribute('style')?.match(/width:\s*(\d+px)/)?.[1]
        ) || parsePixelValue(parent.getAttribute('width'));
    }
    if (!(height > 0)) {
      height =
        parsePixelValue(
          parent.getAttribute('style')?.match(/height:\s*(\d+px)/)?.[1]
        ) || parsePixelValue(parent.getAttribute('height'));
    }
    parent = parent.parentElement;
  }

  return { width: width > 0 ? width : 400, height: height > 0 ? height : 200 };
}

class MockResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe(target) {
    const { width, height } = getMockDimensions(target);
    queueMicrotask(() => {
      this.callback(
        [
          {
            target,
            contentRect: {
              width,
              height,
              top: 0,
              left: 0,
              bottom: height,
              right: width,
              x: 0,
              y: 0,
              toJSON: () => ({}),
            },
            borderBoxSize: [{ inlineSize: width, blockSize: height }],
            contentBoxSize: [{ inlineSize: width, blockSize: height }],
            devicePixelContentBoxSize: [
              { inlineSize: width, blockSize: height },
            ],
          },
        ],
        this
      );
    });
  }

  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = MockResizeObserver;

// Mock getBoundingClientRect for consistent dimensions in JSDOM
const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
Element.prototype.getBoundingClientRect = function () {
  const { width, height } = getMockDimensions(this);
  if (width > 0 || height > 0) {
    return {
      width,
      height,
      top: 0,
      left: 0,
      bottom: height,
      right: width,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    };
  }
  return originalGetBoundingClientRect.call(this);
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
jest.mock('@enzedonline/quill-blot-formatter2');
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
