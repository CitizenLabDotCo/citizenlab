// Parses pixel value from style string, ignoring percentage values.
function parsePixelValue(value: string | undefined | null): number {
  if (!value || typeof value !== 'string') return NaN;
  if (value.endsWith('px')) return parseInt(value, 10);
  if (value.endsWith('%')) return NaN;
  const num = parseInt(value, 10);
  return value === String(num) ? num : NaN;
}

// Gets mock dimensions from element styles/attributes, walking up DOM tree.
function getMockDimensions(element: Element | null): {
  width: number;
  height: number;
} {
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

// Mock getBoundingClientRect to return dimensions based on element styles.
// This is needed because recharts' ResponsiveContainer uses getBoundingClientRect
// to determine chart dimensions, and JSDOM doesn't support real layout.
Element.prototype.getBoundingClientRect = function () {
  const { width, height } = getMockDimensions(this);
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
};

// Mock ResizeObserver that calls callback with dimensions.
// This is needed because our Container component uses ResizeObserver
// to get dimensions for legend positioning.
class MockResizeObserver {
  private callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
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
          } as ResizeObserverEntry,
        ],
        this
      );
    });
  }

  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = MockResizeObserver;
