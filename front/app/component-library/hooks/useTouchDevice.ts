import { useMemo } from 'react';

import useBreakpoint from './useBreakpoint';

/**
 * Hook to detect if the device has touch capability.
 * Returns true for mobile devices & tablets,
 * false for desktop devices.
 *
 * Uses a multi-layered approach for reliable touch detection:
 * 0. Screen size check - large screens always get non-touch UI (buttons, etc.)
 * 1. Hardware check via navigator.maxTouchPoints (modern browsers)
 * 2. Media query for touch input characteristics (hover: none, pointer: coarse)
 * 3. Legacy fallback to 'ontouchstart' with Chrome false positive guard
 *
 * Src: https://www.xjavascript.com/blog/how-can-i-detect-device-touch-support-in-javascript/#step-by-step-implementation-a-reliable-detection-function
 *
 * Useful for when we want to show/hide UI elements based on
 * the device's input method rather than viewport size
 */
const useTouchDevice = () => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const isDesktop = !isSmallerThanTablet;

  return useMemo(() => {
    // 0. Check screen size first - large screens should always show non-touch UI
    // Even if they have touch capability, navigation buttons are more useful on large screens
    // and this is more the intention of this hook
    if (isDesktop) {
      return false;
    }

    // 1. Check for hardware touch support (modern browsers)
    if (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) {
      return true;
    }

    // 2. Check media query for touch input characteristics
    // Targets devices with coarse pointer (e.g., finger) and no hover capability
    const touchQuery = window.matchMedia('(hover: none) and (pointer: coarse)');
    if (touchQuery.matches) {
      return true;
    }

    // 3. Fallback for older browsers (with Chrome false positive guard)
    if ('ontouchstart' in window) {
      // Extra check: Ensure we're not on a desktop Chrome with false touch events
      // This is a heuristic to avoid Chrome's false positives on non-touch desktops
      const isChromeDesktop =
        /Chrome/.test(navigator.userAgent) &&
        /Windows|macOS|Linux/.test(navigator.userAgent);
      if (!isChromeDesktop) {
        return true;
      }
    }

    return false;
  }, [isDesktop]);
};

export default useTouchDevice;
