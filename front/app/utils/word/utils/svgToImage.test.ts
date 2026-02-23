import {
  svgElementToImageBuffer,
  chartContainerToImageBuffer,
  hasSvgChart,
} from './svgToImage';

// Mock OffscreenCanvas for JSDOM environment
class MockOffscreenCanvas {
  width: number;
  height: number;
  private ctx: MockCanvasRenderingContext2D;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.ctx = new MockCanvasRenderingContext2D();
  }

  getContext(type: string) {
    if (type === '2d') return this.ctx;
    return null;
  }

  async convertToBlob(_options?: { type?: string }): Promise<Blob> {
    // Return a minimal valid PNG blob (1x1 white pixel)
    const pngBytes = new Uint8Array([
      0x89,
      0x50,
      0x4e,
      0x47,
      0x0d,
      0x0a,
      0x1a,
      0x0a, // PNG signature
      0x00,
      0x00,
      0x00,
      0x0d,
      0x49,
      0x48,
      0x44,
      0x52, // IHDR chunk
      0x00,
      0x00,
      0x00,
      0x01,
      0x00,
      0x00,
      0x00,
      0x01,
      0x08,
      0x02,
      0x00,
      0x00,
      0x00,
      0x90,
      0x77,
      0x53,
      0xde,
      0x00,
      0x00,
      0x00,
      0x0c,
      0x49,
      0x44,
      0x41, // IDAT chunk
      0x54,
      0x08,
      0xd7,
      0x63,
      0xf8,
      0xcf,
      0xc0,
      0x00,
      0x00,
      0x00,
      0x02,
      0x00,
      0x01,
      0xe2,
      0x21,
      0xbc,
      0x33,
      0x00,
      0x00,
      0x00,
      0x00,
      0x49,
      0x45,
      0x4e, // IEND chunk
      0x44,
      0xae,
      0x42,
      0x60,
      0x82,
    ]);
    // JSDOM's Blob doesn't implement .arrayBuffer() — return a mock with it
    const blob = new Blob([pngBytes], { type: 'image/png' });
    (blob as any).arrayBuffer = async () => pngBytes.buffer;
    return blob;
  }
}

class MockCanvasRenderingContext2D {
  fillStyle = '';
  scale(_x: number, _y: number) {}
  fillRect(_x: number, _y: number, _w: number, _h: number) {}
  drawImage(_img: any, _x: number, _y: number) {}
}

// Helper to create a test SVG element
function createTestSvg(width = 400, height = 200): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  // Add a simple rect so it's not empty
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', '10');
  rect.setAttribute('y', '10');
  rect.setAttribute('width', '100');
  rect.setAttribute('height', '50');
  rect.setAttribute('fill', '#3498db');
  svg.appendChild(rect);

  // JSDOM doesn't implement getBoundingClientRect for SVG
  // Override to return meaningful values
  Object.defineProperty(svg, 'getBoundingClientRect', {
    value: () =>
      ({
        width,
        height,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: width,
        bottom: height,
      } as DOMRect),
    configurable: true,
  });

  return svg;
}

// Helper to create a container div with an SVG inside
function createChartContainer(hasSvg = true): HTMLElement {
  const container = document.createElement('div');
  container.style.width = '400px';
  container.style.height = '200px';

  if (hasSvg) {
    const svg = createTestSvg();
    container.appendChild(svg);
  }

  Object.defineProperty(container, 'getBoundingClientRect', {
    value: () => ({ width: 400, height: 200, x: 0, y: 0 } as DOMRect),
    configurable: true,
  });

  return container;
}

describe('svgToImage', () => {
  let originalOffscreenCanvas: typeof OffscreenCanvas;
  let originalCreateObjectURL: typeof URL.createObjectURL;
  let originalRevokeObjectURL: typeof URL.revokeObjectURL;
  let originalImage: typeof Image;

  beforeEach(() => {
    // Mock OffscreenCanvas
    originalOffscreenCanvas = (global as any).OffscreenCanvas;
    (global as any).OffscreenCanvas = MockOffscreenCanvas;

    // Mock URL methods
    originalCreateObjectURL = URL.createObjectURL;
    originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    URL.revokeObjectURL = jest.fn();

    // Mock Image
    originalImage = (global as any).Image;
    (global as any).Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: ((err: any) => void) | null = null;
      private _src = '';

      get src() {
        return this._src;
      }
      set src(value: string) {
        this._src = value;
        // Simulate async image load
        setTimeout(() => this.onload?.(), 0);
      }
    };
  });

  afterEach(() => {
    (global as any).OffscreenCanvas = originalOffscreenCanvas;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    (global as any).Image = originalImage;
  });

  describe('svgElementToImageBuffer', () => {
    it('returns a Uint8Array PNG buffer from an SVG element', async () => {
      const svg = createTestSvg(400, 200);
      const result = await svgElementToImageBuffer(svg);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('cleans up the blob URL after use', async () => {
      const svg = createTestSvg(400, 200);
      await svgElementToImageBuffer(svg);

      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('creates canvas at the correct scaled dimensions', async () => {
      const svg = createTestSvg(400, 200);
      const MockOffscreenCanvasSpy = jest
        .fn()
        .mockImplementation((w, h) => new MockOffscreenCanvas(w, h));
      (global as any).OffscreenCanvas = MockOffscreenCanvasSpy;

      await svgElementToImageBuffer(svg, { scale: 3 });

      expect(MockOffscreenCanvasSpy).toHaveBeenCalledWith(1200, 600); // 400*3, 200*3
    });

    it('adds a background rect for non-transparent backgrounds', async () => {
      const svg = createTestSvg(100, 100);
      const serialized: string[] = [];
      const origSerialize = XMLSerializer.prototype.serializeToString;
      XMLSerializer.prototype.serializeToString = function (node) {
        const result = origSerialize.call(this, node);
        serialized.push(result);
        return result;
      };

      await svgElementToImageBuffer(svg, { backgroundColor: '#FF0000' });
      XMLSerializer.prototype.serializeToString = origSerialize;

      // The cloned SVG should have a background rect
      expect(serialized[0]).toContain('fill="#FF0000"');
    });

    it('handles minimum 1x1 size for empty SVGs', async () => {
      const svg = createTestSvg(0, 0);
      // Should not throw
      await expect(svgElementToImageBuffer(svg)).resolves.toBeInstanceOf(
        Uint8Array
      );
    });
  });

  describe('chartContainerToImageBuffer', () => {
    it('finds and converts an SVG inside a container', async () => {
      const container = createChartContainer(true);
      const result = await chartContainerToImageBuffer(container);

      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('throws a descriptive error when no SVG is found', async () => {
      const container = createChartContainer(false);

      await expect(chartContainerToImageBuffer(container)).rejects.toThrow(
        'No <svg> element found inside container'
      );
    });
  });

  describe('hasSvgChart', () => {
    it('returns true when container has a visible SVG', () => {
      const container = createChartContainer(true);
      const svg = container.querySelector('svg')!;
      Object.defineProperty(svg, 'getBoundingClientRect', {
        value: () => ({ width: 400, height: 200 } as DOMRect),
        configurable: true,
      });

      expect(hasSvgChart(container)).toBe(true);
    });

    it('returns false when container has no SVG', () => {
      const container = createChartContainer(false);
      expect(hasSvgChart(container)).toBe(false);
    });

    it('returns false when SVG has zero dimensions (not rendered)', () => {
      const container = createChartContainer(true);
      const svg = container.querySelector('svg')!;
      Object.defineProperty(svg, 'getBoundingClientRect', {
        value: () => ({ width: 0, height: 0 } as DOMRect),
        configurable: true,
      });

      expect(hasSvgChart(container)).toBe(false);
    });
  });
});
