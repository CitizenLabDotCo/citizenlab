import React, { useState, useRef, useEffect } from 'react';

import {
  Box,
  colors,
  Icon,
  Text,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { FocusOn } from 'react-focus-on';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const COLLAPSED_HEIGHT = 40;
const DEFAULT_OFFSET = 350;
const NUDGE_DELAY_MS = 15000;
const DRAG_AREA_HEIGHT = 28; // DragHandle height + padding
const SWIPE_THRESHOLD = 50; // Minimum swipe distance to trigger state change

const Container = styled.div<{ translateY: number }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: ${colors.white};
  border-top-left-radius: ${({ translateY }) =>
    translateY <= 0 ? '0' : '16px'};
  border-top-right-radius: ${({ translateY }) =>
    translateY <= 0 ? '0' : '16px'};
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(${({ translateY }) => translateY}px);
  transition: transform 0.3s ease-out;
  height: 100svh;
  z-index: 1050;
  touch-action: none;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

const DragHandle = styled.div`
  width: 40px;
  height: 4px;
  background: ${colors.grey400};
  border-radius: 2px;
  margin: 12px auto;
`;

const DragArea = styled.div`
  position: relative;
  display: block;
  width: 100%;
  padding: 8px 0;
  background: none;
  border: none;
`;

const Overlay = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100svh;
  z-index: 1040;
  pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
`;

const ContentArea = styled(Box)<{ isFullscreen: boolean }>`
  overflow-y: ${({ isFullscreen }) => (isFullscreen ? 'auto' : 'hidden')};
`;

interface Props {
  children: React.ReactNode;
  a11y_panelLabel: string;
  a11y_expandLabel: string;
  a11y_collapseLabel: string;
  /** When this value changes (and is truthy), the sheet expands to fullscreen */
  expandToFullscreenOn?: string | null;
}

type SheetState = 'collapsed' | 'default' | 'fullscreen';

const getNextState = (
  currentState: SheetState,
  direction: 'up' | 'down'
): SheetState => {
  if (direction === 'up') {
    if (currentState === 'collapsed') return 'default';
    if (currentState === 'default') return 'fullscreen';
    return 'fullscreen';
  } else {
    if (currentState === 'fullscreen') return 'default';
    if (currentState === 'default') return 'collapsed';
    return 'collapsed';
  }
};

const BottomSheet = ({
  children,
  a11y_panelLabel,
  a11y_expandLabel,
  a11y_collapseLabel,
  expandToFullscreenOn,
}: Props) => {
  const { formatMessage } = useIntl();
  const [sheetState, setSheetState] = useState<SheetState>('collapsed');
  const [showNudge, setShowNudge] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const dragStartScrollTop = useRef<number>(0);
  const dragStartedInHandle = useRef<boolean>(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragAreaRef = useRef<HTMLDivElement>(null);

  // Show nudge after 15 seconds if still collapsed
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNudge((prev) => {
        // Only show if not already shown and sheet is collapsed
        if (!prev && sheetState === 'collapsed') {
          return true;
        }
        return prev;
      });
    }, NUDGE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [sheetState]);

  const getSheetHeight = () =>
    sheetRef.current?.offsetHeight ?? window.innerHeight;

  const getTranslateYForState = (state: SheetState) => {
    switch (state) {
      case 'fullscreen':
        return 0;
      case 'default':
        return DEFAULT_OFFSET;
      case 'collapsed':
        return getSheetHeight() - COLLAPSED_HEIGHT;
    }
  };

  useEffect(() => {
    if (expandToFullscreenOn) {
      setSheetState('fullscreen');
      contentRef.current?.scrollTo(0, 0);
    }
  }, [expandToFullscreenOn]);

  const isEventInDragArea = (target: EventTarget | null) => {
    if (!target || !dragAreaRef.current) return false;
    return dragAreaRef.current.contains(target as Node);
  };

  const handleSwipeEnd = (startY: number, endY: number) => {
    const delta = endY - startY;

    // Only trigger state change if swipe exceeds threshold
    if (Math.abs(delta) < SWIPE_THRESHOLD) {
      return;
    }

    const direction = delta < 0 ? 'up' : 'down';

    // When fullscreen and swipe didn't start in drag handle, check if user was scrolling
    if (sheetState === 'fullscreen' && !dragStartedInHandle.current) {
      const currentScrollTop = contentRef.current?.scrollTop ?? 0;

      // If content was scrolled at start or is scrolled now, user is scrolling content
      if (dragStartScrollTop.current > 0 || currentScrollTop > 0) {
        return;
      }

      // If swiping up and there's scrollable content, don't change state
      if (direction === 'up') {
        const content = contentRef.current;
        if (content && content.scrollHeight > content.clientHeight) {
          return;
        }
      }
    }

    const newState = getNextState(sheetState, direction);
    setSheetState(newState);

    if (newState === 'fullscreen') {
      contentRef.current?.scrollTo(0, 0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    dragStartScrollTop.current = contentRef.current?.scrollTop ?? 0;
    dragStartedInHandle.current = isEventInDragArea(e.target);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const endY = e.changedTouches[0].clientY;
    handleSwipeEnd(dragStartY.current, endY);
    dragStartY.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent text selection during drag
    e.preventDefault();
    dragStartY.current = e.clientY;
    dragStartScrollTop.current = contentRef.current?.scrollTop ?? 0;
    dragStartedInHandle.current = isEventInDragArea(e.target);

    const onUp = (ev: MouseEvent) => {
      if (dragStartY.current !== null) {
        handleSwipeEnd(dragStartY.current, ev.clientY);
        dragStartY.current = null;
      }
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mouseup', onUp);
  };

  const translateY = getTranslateYForState(sheetState);
  const isExpanded = sheetState !== 'collapsed';
  const isFullscreen = sheetState === 'fullscreen';

  const handleClickOutside = () => {
    if (isExpanded) {
      setSheetState('collapsed');
    }
  };

  return (
    <FocusOn
      enabled={isExpanded}
      autoFocus={true}
      returnFocus={false}
      scrollLock={true}
      onClickOutside={handleClickOutside}
    >
      <Overlay isVisible={isExpanded} onClick={handleClickOutside} />
      <Container
        ref={sheetRef}
        translateY={translateY}
        role="dialog"
        aria-modal={isExpanded}
        aria-label={a11y_panelLabel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        <DragArea
          ref={dragAreaRef}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? a11y_collapseLabel : a11y_expandLabel}
        >
          <Tooltip
            content={
              <Box display="flex" alignItems="center" gap="8px">
                <Icon name="stars" fill={colors.orange500} />
                <Text color="tenantPrimary" fontSize="s" m="0px">
                  {formatMessage(messages.exploreTopicsNudge)}
                </Text>
              </Box>
            }
            placement="top"
            visible={showNudge}
            onClickOutside={() => setShowNudge(false)}
          >
            <DragHandle aria-hidden="true" />
          </Tooltip>
        </DragArea>

        <ContentArea
          ref={contentRef}
          px="16px"
          py="24px"
          isFullscreen={isFullscreen}
          h={`calc(100svh - ${translateY + DRAG_AREA_HEIGHT}px)`}
        >
          {children}
        </ContentArea>
      </Container>
    </FocusOn>
  );
};

export default BottomSheet;
