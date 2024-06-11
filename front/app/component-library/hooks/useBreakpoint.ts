import { useState, useEffect } from 'react';

import { viewportWidths } from '../utils/styleUtils';

const mediaQueries = {
  phone: `(max-width: ${viewportWidths.phone}px)`,
  tablet: `(max-width: ${viewportWidths.tablet}px)`,
  smallDesktop: `(max-width: ${viewportWidths.smallDesktop}px)`,
};

type BreakpointType = keyof typeof mediaQueries;

const useBreakpoint = (breakpointType: BreakpointType) => {
  const [breakpoint, setBreakpoint] = useState(
    window.matchMedia(mediaQueries[breakpointType]).matches
  );

  useEffect(() => {
    const media = window.matchMedia(mediaQueries[breakpointType]);
    if (media.matches !== breakpoint) {
      setBreakpoint(media.matches);
    }

    const listener = () => setBreakpoint(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [breakpointType, breakpoint]);

  return breakpoint;
};

export default useBreakpoint;
