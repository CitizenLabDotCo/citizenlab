import { useEffect, useState } from 'react';

// Sticky column heads under a stuck toolbar read its height from
// --wb-toolbar-h; every page toolbar publishes it while mounted. Returns a
// callback ref, so a toolbar that mounts after its page still registers.
export const useToolbarHeight = () => {
  const [bar, setBar] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!bar || typeof ResizeObserver === 'undefined') return undefined;
    const root = document.documentElement;
    const ro = new ResizeObserver(() => {
      root.style.setProperty('--wb-toolbar-h', `${bar.offsetHeight}px`);
    });
    ro.observe(bar);
    return () => {
      ro.disconnect();
      root.style.removeProperty('--wb-toolbar-h');
    };
  }, [bar]);
  return setBar;
};
