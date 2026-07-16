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

/**
 * Docks the CTA bar once the user scrolls to the first phases section — the
 * moment its top passes under the platform navbar, where the classic project
 * page's sticky bar would pin. It stays docked while the user is below that
 * point and releases when they scroll back above it. Without a phases
 * section the bar never shows.
 */
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
      setDocked(
        !!phasesElement &&
          phasesElement.getBoundingClientRect().top <= stylingConsts.menuHeight
      );
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

  // On phones the bar already positions itself as a fixed footer.
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
