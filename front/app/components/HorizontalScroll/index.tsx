import React, { useEffect, useState, ReactNode } from 'react';

import {
  Box,
  Button,
  useBreakpoint,
  isRtl,
} from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import styled, { useTheme } from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const StyledContainer = styled(Box)<{ snap: boolean }>`
  display: flex;
  gap: 16px;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: nowrap;
  overflow: auto;
  overflow-x: scroll;
  height: auto;
  width: 100%;

  ${isRtl`
  flex-direction: row-reverse;
`}

  ::-webkit-scrollbar {
    display: none;
  }
  scroll-behavior: smooth;
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;

  ${({ snap }) => (snap ? 'scroll-snap-type: x mandatory;' : '')}
`;

interface Props {
  children: ReactNode;
  containerRole?: string; // If the scrollable container needs a specific role, pass it in
  snap?: boolean;
}

/*
 * HorizontalScroll:
 * Wraps children elements with a horizontal scroll container with arrow buttons to scroll left and right.
 */
const HorizontalScroll = ({ children, containerRole, snap = false }: Props) => {
  const theme = useTheme();
  const isSmallerThanPhone = useBreakpoint('phone');
  const { formatMessage } = useIntl();
  const containerRef = React.useRef<HTMLDivElement>(null);
  // Used to determine when the scroll buttons should be disabled (E.g. At scroll end, disable the right button)
  const [atScrollStart, setAtScrollStart] = useState(true);
  const [atScrollEnd, setAtScrollEnd] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const handleScroll = debounce(() => {
      if (!containerRef.current) return;

      // Update scroll states
      const scrollLeft = containerRef.current.scrollLeft;
      setAtScrollStart(scrollLeft === 0);

      const clientWidth = containerRef.current.clientWidth;
      const scrollWidth = containerRef.current.scrollWidth;

      const maxScrollLeft = scrollWidth - clientWidth;
      setAtScrollEnd(scrollLeft >= maxScrollLeft);
    }, 100);

    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Determine if the width of the container is large enough to require horizontal scrolling
  const showArrows =
    containerRef.current &&
    containerRef.current.scrollWidth > containerRef.current.clientWidth;
  const [showArrowButtons, setShowArrowButtons] = useState(showArrows);

  // Update whether arrows/horizontal scrolling is required when the width of the container changes
  useEffect(() => {
    setShowArrowButtons(
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      containerRef.current &&
        containerRef.current.scrollWidth > containerRef.current.clientWidth
    );
  }, [containerRef, showArrows]);

  // Scroll the container by the specified offset
  const horizontalScroll = (scrollOffset: number) => {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!containerRef?.current) return;
    containerRef.current.scrollLeft += scrollOffset;
  };

  return (
    <Box display="flex" flexDirection={theme.isRtl ? 'row-reverse' : 'row'}>
      <Box
        aria-hidden="true"
        my="auto"
        display={showArrowButtons ? 'inherit' : 'none'}
      >
        <Button
          disabled={atScrollStart}
          onClick={() => {
            horizontalScroll(
              isSmallerThanPhone
                ? -200 // Scroll by 200px on mobile
                : -350 // Scroll by 350px on desktop
            );
          }}
          icon={theme.isRtl ? 'chevron-right' : 'chevron-left'}
          buttonStyle="text"
          p="0px"
          my="auto"
          className="e2e-event-previews-scroll-left"
          ariaLabel={formatMessage(messages.scrollLeftLabel)}
        />
      </Box>
      <StyledContainer ref={containerRef} role={containerRole} snap={snap}>
        {children}
      </StyledContainer>
      <Box
        aria-hidden="true"
        my="auto"
        display={showArrowButtons ? 'inherit' : 'none'}
      >
        <Button
          disabled={atScrollEnd}
          onClick={() => {
            horizontalScroll(isSmallerThanPhone ? 200 : 350);
          }}
          icon={theme.isRtl ? 'chevron-left' : 'chevron-right'}
          buttonStyle="text"
          p="0px"
          className="e2e-event-previews-scroll-right"
          ariaLabel={formatMessage(messages.scrollRightLabel)}
        />
      </Box>
    </Box>
  );
};

export default HorizontalScroll;
