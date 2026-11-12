import html2canvas from 'html2canvas';

import { htmlToImageBuffer } from './htmlToImage';

jest.mock('html2canvas');

const PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

const mockCanvas = (width: number, height: number) =>
  ({
    width,
    height,
    toBlob: (callback: BlobCallback) => {
      callback({
        arrayBuffer: async () => PNG_BYTES.buffer,
      } as Blob);
    },
  } as unknown as HTMLCanvasElement);

const mockedHtml2canvas = html2canvas as jest.MockedFunction<
  typeof html2canvas
>;

describe('htmlToImageBuffer', () => {
  beforeEach(() => {
    mockedHtml2canvas.mockReset();
  });

  it('reports the canvas size divided by the scale, not the live element size', async () => {
    // A widget that is 700x300 on screen but whose capture came out 420x900.
    const element = document.createElement('div');
    element.getBoundingClientRect = () =>
      ({ width: 700, height: 300 } as DOMRect);
    mockedHtml2canvas.mockResolvedValue(mockCanvas(840, 1800));

    const { width, height } = await htmlToImageBuffer(element, {
      scale: 2,
      forceRaster: true,
    });

    expect({ width, height }).toEqual({ width: 420, height: 900 });
  });

  it('captures at the live viewport size', async () => {
    const element = document.createElement('div');
    mockedHtml2canvas.mockResolvedValue(mockCanvas(1400, 600));

    await htmlToImageBuffer(element, { scale: 2, forceRaster: true });

    const passedOptions = mockedHtml2canvas.mock.calls[0][1];
    expect(passedOptions).not.toHaveProperty('windowWidth');
    expect(passedOptions).not.toHaveProperty('windowHeight');
  });
});
