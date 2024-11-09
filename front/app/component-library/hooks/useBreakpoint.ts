import { useState, useEffect } from 'react';

import { viewportWidths } from '../utils/styleUtils';

const mediaQueries = {
  phone: `(max-width: ${viewportWidths.phone}px)`,
  tablet: `(max-width: ${viewportWidths.tablet}px)`,
  smallDesktop: `(max-width: ${viewportWidths.smallDesktop}px)`,
};

type BreakpointType = keyof typeof mediaQueries;

const useBreakpoint = (breakpointType: BreakpointType) => {
  const mediaQueryList = window.matchMedia(mediaQueries[breakpointType]);
  const [matchesBreakpoint, setMatchesBreakpoint] = useState(
    mediaQueryList.matches
  );

  useEffect(() => {
    const listener = (e: MediaQueryListEvent) => {
      setMatchesBreakpoint(e.matches);
    };

    mediaQueryList.addEventListener('change', listener);

    return () => mediaQueryList.removeEventListener('change', listener);
  }, [mediaQueryList]);

  return matchesBreakpoint;
};

export default useBreakpoint;
