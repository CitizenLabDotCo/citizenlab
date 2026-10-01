interface MeasuredBox {
  nodeId: string;
  width: number;
  height: number;
  dataElements?: number;
}

export interface Metrics {
  root: { width: number; height: number };
  charts: MeasuredBox[];
  boxes: MeasuredBox[];
}

// Anything an element can be identified by, so a failing check can name it.
const identify = (element: Element): string => {
  const named =
    element.getAttribute('data-node-id') ?? element.getAttribute('id');
  if (named) return named;

  const [firstClass] = element.className.toString().split(' ');
  return firstClass || element.tagName.toLowerCase();
};

/**
 * Measures the rendered result.
 *
 * Reports numbers, never verdicts: what counts as too wide or too short is the
 * check service's business, and keeping the judgement out of the page keeps it out
 * of reach of the generated code being judged.
 */
const measure = (rootSelector: string): Metrics => {
  const root = document.querySelector(rootSelector);
  if (!root) {
    return { root: { width: 0, height: 0 }, charts: [], boxes: [] };
  }

  const rootBox = root.getBoundingClientRect();

  const charts = [...root.querySelectorAll('.recharts-wrapper')].map(
    (wrapper) => {
      const box = wrapper.getBoundingClientRect();
      // A chart with no path and no rect drew an empty frame.
      const dataElements = wrapper.querySelectorAll(
        'svg path.recharts-curve, svg path.recharts-sector, svg .recharts-bar-rectangle, svg .recharts-dot'
      ).length;

      return {
        nodeId: identify(wrapper),
        width: box.width,
        height: box.height,
        dataElements,
      };
    }
  );

  // Only elements that actually paint: a zero-height wrapper cannot be clipped.
  const boxes = [...root.querySelectorAll('*')]
    .map((element) => ({ element, box: element.getBoundingClientRect() }))
    .filter(({ box }) => box.width > 0 && box.height > 0)
    .map(({ element, box }) => ({
      nodeId: identify(element),
      width: box.width,
      height: box.height,
    }));

  return {
    root: { width: rootBox.width, height: rootBox.height },
    charts,
    boxes,
  };
};

export default measure;
