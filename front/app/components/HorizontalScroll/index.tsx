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
  snap?: boolean; // Whether the container should snap to elements
  hideArrowButtons?: boolean; // Whether to hide the arrow buttons;
}

/*
 * HorizontalScroll:
 * Wraps children elements with a horizontal scroll container with arrow buttons to scroll left and right.
 */
const HorizontalScroll = ({
  children,
  containerRole,
  snap = false,
  hideArrowButtons = false,
}: Props) => {
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
  const [_showArrowButtons, setShowArrowButtons] = useState(showArrows);
  const showArrowButtons = _showArrowButtons && !hideArrowButtons;

  // Update whether arrows/horizontal scrolling is required when the width of the container changes
  useEffect(() => {
    setShowArrowButtons(
      containerRef.current &&
        containerRef.current.scrollWidth > containerRef.current.clientWidth
    );
  }, [containerRef, showArrows]);

  // Scroll the container by the specified offset
  const horizontalScroll = (direction: 'backward' | 'forward') => {
    if (!containerRef.current) return;
    const absoluteOffset = isSmallerThanPhone ? 350 : 200;
    const offset = direction === 'backward' ? -absoluteOffset : absoluteOffset;

    containerRef.current.scrollLeft += offset;
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
            horizontalScroll('backward');
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
            horizontalScroll('forward');
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
