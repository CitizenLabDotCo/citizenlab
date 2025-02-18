import { viewportWidths } from '@citizenlab/cl2-component-library';

interface IScrollToElementParams {
  id: string;
  behavior?: 'smooth' | 'auto';
  offset?: number;
  shouldFocus?: boolean;
}

export function scrollToElement({
  id,
  behavior,
  offset,
  shouldFocus,
}: IScrollToElementParams) {
  const element = document.getElementById(id);
  if (!element) return;

  const elementTop = element.getBoundingClientRect().top;
  const top = elementTop + window.pageYOffset - (offset ?? 100);

  window.scrollTo({ top, behavior: behavior ?? 'smooth' });

  if (shouldFocus) {
    // make sure the element has a tabindex so it can be focused
    element.setAttribute('tabindex', '-1');
    element.focus();
  }
}

export function scrollToElement2(selector: string, offset = 100) {
  if (!selector) return;

  // Helper to actually perform the scroll
  const performScroll = () => {
    const element = document.querySelector(selector);
    if (element) {
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  // Wait for the page to fully load and render
  const onLoad = () => {
    requestAnimationFrame(() => {
      setTimeout(performScroll, 300); // Allow some extra time for layout stability
    });
  };

  if (document.readyState === 'complete') {
    onLoad();
  } else {
    window.addEventListener('load', onLoad, { once: true });
  }
}

export const scrollToTop = (context?: 'link' | 'clHistory') => {
  const isMobileOrSmaller = window.innerWidth <= viewportWidths.tablet;

  let scrollWithTimeout: NodeJS.Timeout;

  // In some cases & on some mobile browsers, we need a timeout for this to work correctly
  if (isMobileOrSmaller) {
    scrollWithTimeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  } else {
    context && context === 'link' // For links, we want to scroll up after the page redirect, so we use a timeout
      ? (scrollWithTimeout = setTimeout(() => {
          window.scrollTo(0, 0);
        }, 5))
      : window.scrollTo(0, 0);
  }

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return () => scrollWithTimeout && clearTimeout(scrollWithTimeout);
};
