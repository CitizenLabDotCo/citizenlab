/**
 * SVG-native image capture for Word documents.
 * Uses SVG serialization + OffscreenCanvas instead of html2canvas.
 */

interface SvgToImageOptions {
  /** Pixel density multiplier. 2 = 2x resolution (recommended for print) */
  scale?: number;
  /** Background fill color (default: white) */
  backgroundColor?: string;
}

/**
 * Converts an SVG element to a PNG Uint8Array suitable for docx ImageRun.
 *
 * Algorithm: serialize SVG → Blob URL → Image → OffscreenCanvas → PNG.
 */
export async function svgElementToImageBuffer(
  svgElement: SVGElement,
  options: SvgToImageOptions = {}
): Promise<Uint8Array> {
  const { scale = 2, backgroundColor = '#FFFFFF' } = options;

  const rect = svgElement.getBoundingClientRect();
  const width = Math.max(rect.width, 1);
  const height = Math.max(rect.height, 1);

  // Inline all computed styles into the SVG before serialization.
  // This is necessary because the blob URL loses access to external stylesheets.
  const clonedSvg = svgElement.cloneNode(true) as SVGElement;
  inlineComputedStyles(svgElement, clonedSvg);

  // Ensure explicit width/height attributes exist on the root SVG
  clonedSvg.setAttribute('width', String(width));
  clonedSvg.setAttribute('height', String(height));

  // Add background rectangle if needed
  if (backgroundColor !== 'transparent') {
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', '100%');
    bg.setAttribute('height', '100%');
    bg.setAttribute('fill', backgroundColor);
    clonedSvg.insertBefore(bg, clonedSvg.firstChild);
  }

  const svgString = new XMLSerializer().serializeToString(clonedSvg);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    const canvas = new OffscreenCanvas(
      Math.round(width * scale),
      Math.round(height * scale)
    );
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (err) => reject(new Error(`SVG image load failed: ${err}`));
      img.src = url;
    });

    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);

    const pngBlob = await canvas.convertToBlob({ type: 'image/png' });
    const arrayBuffer = await pngBlob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Finds the first <svg> inside an HTML container and converts it to PNG.
 * Primary entry point for chart components (Recharts renders <svg> inside a wrapper <div>).
 */
export async function chartContainerToImageBuffer(
  container: HTMLElement,
  options: SvgToImageOptions = {}
): Promise<Uint8Array> {
  const svgEl = container.querySelector('svg');
  if (svgEl) {
    return svgElementToImageBuffer(svgEl, options);
  }
  throw new Error(
    `No <svg> element found inside container. ` +
      `For non-SVG components, use htmlToImageBuffer instead.`
  );
}

/**
 * Inlines computed CSS styles onto an SVG clone's elements.
 * Necessary because blob URLs lose access to document stylesheets.
 */
function inlineComputedStyles(source: Element, target: Element): void {
  const STYLE_PROPERTIES = [
    'fill',
    'stroke',
    'stroke-width',
    'stroke-dasharray',
    'opacity',
    'font-family',
    'font-size',
    'font-weight',
    'text-anchor',
    'dominant-baseline',
    'color',
    'display',
    'visibility',
  ];

  const sourceComputed = window.getComputedStyle(source);
  const targetEl = target as HTMLElement;

  for (const prop of STYLE_PROPERTIES) {
    const value = sourceComputed.getPropertyValue(prop);
    if (value && value !== '') {
      targetEl.style.setProperty(prop, value);
    }
  }

  // Recurse into children
  const sourceChildren = source.children;
  const targetChildren = target.children;
  for (let i = 0; i < sourceChildren.length; i++) {
    inlineComputedStyles(sourceChildren[i], targetChildren[i]);
  }
}

const MIN_CHART_SIZE = 50;

export function findChartSvg(container: HTMLElement): SVGElement | null {
  const svgs = container.querySelectorAll('svg');
  let best: SVGElement | null = null;
  let bestArea = 0;

  for (const svg of svgs) {
    const rect = svg.getBoundingClientRect();
    if (rect.width >= MIN_CHART_SIZE && rect.height >= MIN_CHART_SIZE) {
      const area = rect.width * rect.height;
      if (area > bestArea) {
        best = svg;
        bestArea = area;
      }
    }
  }

  return best;
}

export function hasSvgChart(container: HTMLElement): boolean {
  return findChartSvg(container) !== null;
}
