import React, { useEffect, useRef, useState } from 'react';

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

// 'overlay' floats the bar under the navbar once the page has scrolled it
// there; 'inline' keeps it in the page flow when the page cannot scroll at
// all, so it doesn't cover the content at the top of the page.
type DockMode = 'none' | 'overlay' | 'inline';

const CTABar = ({ projectId, containerRef }: Props) => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const [dockMode, setDockMode] = useState<DockMode>('none');
  const inlineBarRef = useRef<HTMLDivElement | null>(null);

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
        setDockMode('none');
        return;
      }
      const { top } = phasesElement.getBoundingClientRect();
      // The inline bar participates in layout, so measure the page as it
      // would be without it — otherwise its own insertion flips the mode.
      const inlineBarHeight = inlineBarRef.current?.offsetHeight ?? 0;
      const scrollableHeight =
        document.documentElement.scrollHeight -
        inlineBarHeight -
        window.innerHeight;

      if (top <= stylingConsts.menuHeight) {
        // The phases section pinned under the navbar.
        setDockMode('overlay');
      } else if (scrollableHeight <= 1) {
        // The page cannot scroll, so its top is still in view and an overlay
        // would cover it.
        setDockMode('inline');
      } else if (scrollableHeight - window.scrollY <= 1) {
        // Scrolled as far as the page goes without the phases section ever
        // reaching the navbar.
        setDockMode('overlay');
      } else {
        setDockMode('none');
      }
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

  if (dockMode === 'none') return null;

  if (isSmallerThanTablet) {
    return <ProjectCTABar projectId={projectId} />;
  }

  if (dockMode === 'inline') {
    return (
      <Box ref={inlineBarRef} width="100vw" ml="calc(50% - 50vw)">
        <ProjectCTABar projectId={projectId} />
      </Box>
    );
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
