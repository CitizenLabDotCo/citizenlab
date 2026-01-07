import { useMemo } from 'react';

/**
 * Hook to detect if the device has touch capability.
 * Returns true for mobile devices & tablets,
 * false for desktop devices.
 *
 * Useful for when we want to show/hide UI elements based on
 * the device's input method rather than viewport size
 */
const useTouchDevice = () => {
  return useMemo(() => navigator.maxTouchPoints > 0, []);
};

export default useTouchDevice;
