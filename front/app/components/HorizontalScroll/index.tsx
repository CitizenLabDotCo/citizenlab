import { Box, Button } from '@citizenlab/cl2-component-library';
import React, { useEffect, useState } from 'react';
import { useTheme } from 'styled-components';

interface Props {
  containerRef?: React.RefObject<HTMLDivElement>; // Ref of the container with elements which can be laterally scrolled through
  isSmallerThanPhone?: boolean;
  children: React.ReactNode;
}

/*
 * HorizontalScroll:
 * Wraps a scrollable container with lateral scroll arrow buttons to scroll left and right.
 */
const HorizontalScroll = ({
  containerRef,
  isSmallerThanPhone,
  children,
}: Props) => {
  const theme = useTheme();

  // Used to determine when the scroll buttons should be disabled (E.g. At scroll end, disable the right button)
  const [atScrollStart, setAtScrollStart] = useState(true);
  const [atScrollEnd, setAtScrollEnd] = useState(false);

  useEffect(() => {
    containerRef?.current?.addEventListener('scroll', () => {
      // Update scroll states
      if (!containerRef?.current) return;
      setAtScrollStart(containerRef.current.scrollLeft === 0);
      const maxScrollLeft =
        containerRef.current.scrollWidth - containerRef.current.clientWidth;
      setAtScrollEnd(containerRef.current.scrollLeft >= maxScrollLeft);
    });
  });

  // Determine if the width of the container is large enough to require lateral scrolling
  const showArrows =
    containerRef?.current &&
    containerRef.current.scrollWidth > containerRef.current.clientWidth;
  const [showArrowButtons, setShowArrowButtons] = useState(showArrows);

  // Update whether arrows/lateral scrolling is required when the width of the container changes
  useEffect(() => {
    setShowArrowButtons(
      containerRef?.current &&
        containerRef.current.scrollWidth > containerRef.current.clientWidth
    );
  }, [containerRef, showArrows]);

  // Scroll the container by the specified offset
  const lateralScroll = (scrollOffset: number) => {
    if (!containerRef?.current) return;
    containerRef.current.scrollLeft += scrollOffset;
  };

  return (
    <Box
      id="e2e-event-previews"
      display="flex"
      flexDirection={theme.isRtl ? 'row-reverse' : 'row'}
    >
      <Box
        aria-hidden="true"
        my="auto"
        display={showArrowButtons ? 'inherit' : 'none'}
      >
        <Button
          disabled={atScrollStart}
          onClick={() => {
            lateralScroll(
              isSmallerThanPhone
                ? -200 // Scroll by 200px on mobile
                : -350 // Scroll by 350px on desktop
            );
          }}
          icon={theme.isRtl ? 'chevron-right' : 'chevron-left'}
          buttonStyle="text"
          p="0px"
          my="auto"
          id="e2e-event-previews-scroll-left"
        />
      </Box>
      {children}
      <Box
        aria-hidden="true"
        my="auto"
        display={showArrowButtons ? 'inherit' : 'none'}
      >
        <Button
          disabled={atScrollEnd}
          onClick={() => {
            lateralScroll(isSmallerThanPhone ? 200 : 350);
          }}
          icon={theme.isRtl ? 'chevron-left' : 'chevron-right'}
          buttonStyle="text"
          p="0px"
          id="e2e-event-previews-scroll-right"
        />
      </Box>
    </Box>
  );
};

export default HorizontalScroll;
