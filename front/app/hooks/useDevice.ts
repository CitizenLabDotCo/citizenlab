import { viewportWidths } from '@citizenlab/cl2-component-library';
import { TDevice } from 'components/admin/SelectPreviewDevice';

export default function useDevice() {
  const isPhone = getBreakpoint('phone');
  const isTablet = getBreakpoint('tablet');

  const device: TDevice = (() => {
    if (isPhone) return 'phone';
    if (isTablet) return 'tablet';
    return 'desktop';
  })();

  return device;
}

const mediaQueries = {
  phone: `(max-width: ${viewportWidths.phone}px)`,
  tablet: `(max-width: ${viewportWidths.tablet}px)`,
  smallDesktop: `(max-width: ${viewportWidths.smallDesktop}px)`,
};

type BreakpointType = keyof typeof mediaQueries;

export function getBreakpoint(breakpointType: BreakpointType) {
  return window.matchMedia(mediaQueries[breakpointType]).matches;
}
