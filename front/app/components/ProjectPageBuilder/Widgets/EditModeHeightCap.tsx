import React, { useEffect, useRef, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useEditor } from '@craftjs/core';

import AdminOnlyNote from './EmptyState/AdminOnlyNote';
import messages from './messages';

// Data-driven sections (phase content, events) grow with their live content
// and can make the edit canvas thousands of pixels tall, which makes dragging
// widgets across the page painful. In the edit canvas they are capped to this
// height with a fade; previews and the public page always render in full.
const CAP_HEIGHT = 440;
const FADE_HEIGHT = 96;

const EditModeHeightCap = ({ children }: { children: React.ReactNode }) => {
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isCapped, setIsCapped] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const element = contentRef.current;
    if (!element) return;

    const measure = () => setIsCapped(element.scrollHeight > CAP_HEIGHT);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Box>
      <Box
        maxHeight={`${CAP_HEIGHT}px`}
        overflow="hidden"
        position="relative"
        data-testid="editModeHeightCap"
      >
        <div ref={contentRef}>{children}</div>
        {isCapped && (
          <Box
            position="absolute"
            bottom="0"
            left="0"
            right="0"
            height={`${FADE_HEIGHT}px`}
            background="linear-gradient(rgba(255, 255, 255, 0), #fff)"
          />
        )}
      </Box>
      {isCapped && (
        <Box display="flex" justifyContent="center" py="4px">
          <AdminOnlyNote message={messages.sectionHeightCappedNote} />
        </Box>
      )}
    </Box>
  );
};

export default EditModeHeightCap;
