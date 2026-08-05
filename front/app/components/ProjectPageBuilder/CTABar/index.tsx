import React, { useEffect, useState } from 'react';

import {
  Box,
  stylingConsts,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import ProjectCTABar from 'containers/ProjectsShowPage/ProjectCTABar';

import { PHASES_WIDGET_SELECTOR } from '../Widgets/Phases';

type Props = {
  projectId: string;
  containerRef: React.RefObject<HTMLElement>;
};

const CTABar = ({ projectId, containerRef }: Props) => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let phasesElement: Element | null = null;
    let frame: number | null = null;

    const update = () => {
      frame = null;
      if (!phasesElement?.isConnected) {
        phasesElement = container.querySelector(PHASES_WIDGET_SELECTOR);
      }
      if (!phasesElement) {
        setDocked(false);
        return;
      }
      // Docked once the phases section pins under the navbar — or once the
      // page is scrolled as far as it goes, so short pages whose section can
      // never reach the navbar still get the bar (immediately when the page
      // doesn't scroll at all).
      const { top } = phasesElement.getBoundingClientRect();
      const remainingScroll =
        document.documentElement.scrollHeight -
        window.innerHeight -
        window.scrollY;
      setDocked(top <= stylingConsts.menuHeight || remainingScroll <= 1);
    };

    const requestUpdate = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update();
    // Capture-phase listener so scrolls of nested containers (e.g. the
    // builder's preview wrapper) are caught too.
    window.addEventListener('scroll', requestUpdate, {
      capture: true,
      passive: true,
    });
    window.addEventListener('resize', requestUpdate);
    // Widgets render asynchronously (and can be rearranged in previews), so
    // re-evaluate whenever the page content changes.
    const observer = new MutationObserver(requestUpdate);
    observer.observe(container, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('scroll', requestUpdate, { capture: true });
      window.removeEventListener('resize', requestUpdate);
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [containerRef]);

  if (!docked) return null;

  if (isSmallerThanTablet) {
    return <ProjectCTABar projectId={projectId} />;
  }

  return (
    <Box
      position="fixed"
      top={`${stylingConsts.menuHeight}px`}
      left="0"
      right="0"
      zIndex="1000"
    >
      <ProjectCTABar projectId={projectId} />
    </Box>
  );
};

export default CTABar;
