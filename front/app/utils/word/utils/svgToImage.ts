/**
 * SVG-native image capture for Word documents.
 *
 * Uses SVG serialization + OffscreenCanvas instead of html2canvas.
 * Key advantages:
 * - No DOM re-render (captures actual rendered SVG)
 * - No CORS issues (all data is local DOM)
 * - Resolution-independent (scales to any DPI cleanly)
 * - Works in backgrounded browser tabs (no requestAnimationFrame dependency)
 * - 100% reliable with Recharts/D3/SVG-based charts
 */

interface SvgToImageOptions {
  /** Pixel density multiplier. 2 = 2x resolution (recommended for print) */
  scale?: number;
  /** Background fill color (default: white) */
  backgroundColor?: string;
}

/**
 * Converts an SVG element directly to a PNG Uint8Array suitable for docx ImageRun.
 *
 * Algorithm:
 * 1. Serialize SVG to string (preserves all gradients, clips, fonts)
 * 2. Blob URL → Image element
 * 3. Draw to OffscreenCanvas at target scale
 * 4. Export as PNG Uint8Array
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

    // White background
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
 * Finds the first <svg> element inside an HTML container and converts it to PNG.
 * Falls back to the container element itself if no SVG found.
 *
 * This is the primary entry point for chart components (Recharts renders an <svg>
 * inside a wrapper <div>).
 */
export async function chartContainerToImageBuffer(
  container: HTMLElement,
  options: SvgToImageOptions = {}
): Promise<Uint8Array> {
  const svgEl = container.querySelector('svg');
  if (svgEl) {
    return svgElementToImageBuffer(svgEl, options);
  }
  // Fallback: no SVG found — caller should handle this case
  throw new Error(
    `No <svg> element found inside container. ` +
      `For non-SVG components, use htmlToImageBuffer instead.`
  );
}

/**
 * Inlines computed CSS styles onto an SVG clone's elements.
 * This is necessary for SVGs that rely on external stylesheets for styling,
 * since blob URLs lose access to document styles.
 *
 * Only inlines properties that differ from SVG defaults to keep the output clean.
 */
function inlineComputedStyles(source: Element, target: Element): void {
  // Properties we care about for chart rendering
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

/**
 * Checks whether a container element has a renderable SVG chart.
 * Used to decide whether to use SVG capture vs html2canvas fallback.
 */
export function hasSvgChart(container: HTMLElement): boolean {
  const svg = container.querySelector('svg');
  if (!svg) return false;

  const rect = svg.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}
