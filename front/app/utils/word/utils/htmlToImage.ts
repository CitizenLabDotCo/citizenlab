import html2canvas from 'html2canvas';

interface HtmlToImageOptions {
  scale?: number;
  backgroundColor?: string;
}

/**
 * Converts an HTML element to a PNG image buffer suitable for Word documents.
 * Uses html2canvas to render HTML to canvas, then extracts as Uint8Array.
 *
 * @param element - The HTML element to convert
 * @param options - Configuration options for the conversion
 * @returns Promise<Uint8Array> - PNG image data as Uint8Array for docx ImageRun
 */
export async function htmlToImageBuffer(
  element: HTMLElement,
  options: HtmlToImageOptions = {}
): Promise<Uint8Array> {
  const { scale = 2, backgroundColor = '#FFFFFF' } = options;

  const canvas = await html2canvas(element, {
    scale,
    backgroundColor,
    useCORS: true,
    logging: false,
    // Ensure we capture the full element
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error('Failed to convert canvas to blob'));
          return;
        }

        try {
          const arrayBuffer = await blob.arrayBuffer();
          resolve(new Uint8Array(arrayBuffer));
        } catch (error) {
          reject(error);
        }
      },
      'image/png',
      1.0
    );
  });
}
