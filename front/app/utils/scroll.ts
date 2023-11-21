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

type scrollToTopProps = {
  context: 'link' | 'clHistory';
};
export const scrollToTop = ({ context }: scrollToTopProps) => {
  const isMobileOrSmaller = window.innerWidth <= viewportWidths.tablet;

  let scrollWithTimeout: NodeJS.Timeout;

  // In some cases & on some mobile browsers, we need a timeout for this to work correctly
  if (isMobileOrSmaller) {
    scrollWithTimeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  } else {
    context === 'link' // For links, we want to scroll up after the page redirect, so we use a timeout
      ? (scrollWithTimeout = setTimeout(() => {
          window.scrollTo(0, 0);
        }, 20))
      : window.scrollTo(0, 0);
  }

  return () => scrollWithTimeout && clearTimeout(scrollWithTimeout);
};
