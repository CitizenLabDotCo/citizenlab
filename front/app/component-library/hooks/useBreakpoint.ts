import { useState, useEffect } from 'react';

import { viewportWidths } from '../utils/styleUtils';

const mediaQueries = {
  phone: `(max-width: ${viewportWidths.phone}px)`,
  tablet: `(max-width: ${viewportWidths.tablet}px)`,
  smallDesktop: `(max-width: ${viewportWidths.smallDesktop}px)`,
};

type BreakpointType = keyof typeof mediaQueries;

const useBreakpoint = (breakpointType: BreakpointType) => {
  const [matchesBreakpoint, setMatchesBreakpoint] = useState(
    window.matchMedia(mediaQueries[breakpointType]).matches
  );

  useEffect(() => {
    const newMediaQueryList = window.matchMedia(mediaQueries[breakpointType]);

    const listener = (e: MediaQueryListEvent) => {
      setMatchesBreakpoint(e.matches);
    };

    newMediaQueryList.addEventListener('change', listener);

    return () => newMediaQueryList.removeEventListener('change', listener);
  }, [breakpointType]);

  return matchesBreakpoint;
};

export default useBreakpoint;
