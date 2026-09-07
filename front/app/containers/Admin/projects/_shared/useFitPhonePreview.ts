import { useEffect, useState } from 'react';

export const PHONE_LOGICAL_WIDTH = 400;
export const PHONE_LOGICAL_HEIGHT = 800;
export const PHONE_PREVIEW_PADDING = 32;

const DEFAULT_SCALE = 0.8;
const MAX_SCALE = 1;

/**
 * Renders a preview at a fixed logical phone viewport and scales the whole
 * thing to fit its container, so components keep their real proportions
 * instead of being squeezed into a narrow iframe ("scale, don't shrink").
 *
 * Height is measured against the window rather than the container, because
 * the container's own height follows its content. The container is tracked in
 * state so the fit is measured again whenever the node attaches, which is
 * what makes it work for callers that render a spinner first.
 */
const useFitPhonePreview = () => {
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!container) return;

    const computeScale = () => {
      const { top, width } = container.getBoundingClientRect();
      const availableWidth = width - 2 * PHONE_PREVIEW_PADDING;
      const availableHeight =
        window.innerHeight - top - 2 * PHONE_PREVIEW_PADDING;

      setScale(
        Math.max(
          0,
          Math.min(
            MAX_SCALE,
            Math.min(
              availableWidth / PHONE_LOGICAL_WIDTH,
              availableHeight / PHONE_LOGICAL_HEIGHT
            )
          )
        )
      );
    };

    computeScale();
    const observer = new ResizeObserver(computeScale);
    observer.observe(container);
    window.addEventListener('resize', computeScale);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', computeScale);
    };
  }, [container]);

  return { scale, containerRef: setContainer };
};

export default useFitPhonePreview;
