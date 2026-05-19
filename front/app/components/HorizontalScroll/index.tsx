import React, { useEffect, useState, ReactNode } from 'react';

import {
  Box,
  Button,
  useBreakpoint,
  isRtl,
} from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const Wrapper = styled(Box)`
  position: relative;
`;

const ArrowBox = styled(Box)<{ side: 'start' | 'end' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  ${({ side }) => (side === 'start' ? 'left: 0;' : 'right: 0;')}

  ${isRtl`
    ${({ side }: { side: 'start' | 'end' }) =>
      side === 'start' ? 'left: auto; right: 0;' : 'right: auto; left: 0;'}
  `}
`;

const StyledContainer = styled(Box)`
  display: flex;
  gap: 16px;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: nowrap;
  overflow: auto;
  overflow-x: scroll;
  height: auto;
  width: 100%;
  // Leave room for the keyboard focus ring on children (extends ~6px outside
  // the element). overflow:scroll clips descendant outlines, so we pad the
  // container and pull it back with a negative margin so the visual layout is
  // unchanged. The width is widened by 12px so the inner content area stays
  // 100% of the parent — otherwise horizontal padding would falsely trigger
  // overflow on tabs that naturally fit. Safe to do here because the arrows
  // are absolutely positioned and no longer share flex space with the
  // scroller.
  width: calc(100% + 12px);
  padding: 6px;
  margin: -6px;

  ${isRtl`
  flex-direction: row-reverse;
`}

  ::-webkit-scrollbar {
    display: none;
  }
  scroll-behavior: smooth;
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
`;

interface Props {
  children: ReactNode;
  containerRole?: string; // If the scrollable container needs a specific role, pass it in
}

/*
 * HorizontalScroll:
 * Wraps children elements with a horizontal scroll container with arrow buttons to scroll left and right.
 *
 * Arrow buttons are absolutely positioned over the scroll container's edges so
 * that toggling their visibility does not change the container's width. This
 * keeps `scrollWidth > clientWidth` a stable, non-bistable measurement.
 */
const HorizontalScroll = ({ children, containerRole }: Props) => {
  const theme = useTheme();
  const isSmallerThanPhone = useBreakpoint('phone');
  const { formatMessage } = useIntl();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [atScrollStart, setAtScrollStart] = useState(true);
  const [atScrollEnd, setAtScrollEnd] = useState(false);
  const [showArrowButtons, setShowArrowButtons] = useState(false);

  // Recompute arrow visibility and scroll-edge state on mount, on every size
  // change (ResizeObserver), and on scroll.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      setShowArrowButtons(container.scrollWidth > container.clientWidth);
      setAtScrollStart(container.scrollLeft === 0);
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      setAtScrollEnd(container.scrollLeft >= maxScrollLeft);
    };

    update();
    container.addEventListener('scroll', update);
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(container);
    return () => {
      container.removeEventListener('scroll', update);
      resizeObserver.disconnect();
    };
  }, []);

  const horizontalScroll = (scrollOffset: number) => {
    if (!containerRef.current) return;
    containerRef.current.scrollLeft += scrollOffset;
  };

  return (
    <Wrapper>
      <StyledContainer ref={containerRef} role={containerRole}>
        {children}
      </StyledContainer>
      <ArrowBox
        side="start"
        aria-hidden="true"
        display={showArrowButtons ? 'block' : 'none'}
      >
        <Button
          disabled={atScrollStart}
          onClick={() => {
            horizontalScroll(isSmallerThanPhone ? -200 : -350);
          }}
          icon={theme.isRtl ? 'chevron-right' : 'chevron-left'}
          buttonStyle="text"
          p="0px"
          className="e2e-event-previews-scroll-left"
          ariaLabel={formatMessage(messages.scrollLeftLabel)}
        />
      </ArrowBox>
      <ArrowBox
        side="end"
        aria-hidden="true"
        display={showArrowButtons ? 'block' : 'none'}
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
      </ArrowBox>
    </Wrapper>
  );
};

export default HorizontalScroll;
