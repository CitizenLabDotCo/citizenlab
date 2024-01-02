import React, { useEffect, useState } from 'react';
import { useTheme } from 'styled-components';
import Box from '../Box';
import Button from '../Button';
import testEnv from '../../utils/testUtils/testEnv';
interface Props {
  containerRef?: React.RefObject<HTMLDivElement>; // Ref of the container with elements which can be laterally scrolled through
  scrollBtnDistanceMobile?: number; // Lateral scroll distance on arrow click for mobile
  scrollBtnDistanceDesktop?: number; // Lateral scroll distance on arrow click for desktop
  isSmallerThanPhone?: boolean;
  children: React.ReactNode;
}

/*
 * LateralScrollControls:
 * Wraps a scrollable container with lateral scroll arrow buttons to scroll left and right.
 */
const LateralScrollControls = ({
  containerRef,
  scrollBtnDistanceMobile = 200,
  scrollBtnDistanceDesktop = 350,
  isSmallerThanPhone,
  children,
}: Props) => {
  const theme = useTheme();

  // Used to determine when the scroll buttons should be disabled (E.g. At scroll end, disable the right button)
  const [atScrollStart, setAtScrollStart] = useState(true);
  const [atScrollEnd, setAtScrollEnd] = useState(false);

  containerRef?.current?.addEventListener('scroll', () => {
    // Update scroll states
    if (!containerRef?.current) return;
    setAtScrollStart(containerRef.current.scrollLeft === 0);
    const maxScrollLeft =
      containerRef.current.scrollWidth - containerRef.current.clientWidth;
    setAtScrollEnd(containerRef.current.scrollLeft >= maxScrollLeft);
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
                ? -scrollBtnDistanceMobile
                : -scrollBtnDistanceDesktop
            );
          }}
          icon={theme.isRtl ? 'chevron-right' : 'chevron-left'}
          buttonStyle="text"
          p="0px"
          my="auto"
          id="e2e-event-previews-scroll-left"
          data-testid={testEnv('event-previews-scroll-left')}
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
          data-testid={testEnv('event-previews-scroll-right')}
        />
      </Box>
    </Box>
  );
};

export default LateralScrollControls;
