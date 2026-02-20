import React, { useEffect, useRef, useState } from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';
import { FocusOn } from 'react-focus-on';
import styled from 'styled-components';

import { InputTerm } from 'api/phases/types';

import { useIntl } from 'utils/cl-intl';

import SeeAllButton from './BottomSheet/SeeAllButton';
import messages from './messages';

const COLLAPSED_HEIGHT = 60;
const PEEK_DELAY_MS = 10000;
const PEEK_DURATION_MS = 1000;
const DRAG_AREA_HEIGHT = 28;
const SWIPE_THRESHOLD = 50;

const Container = styled.div<{ translateY: number; isDragging: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100dvh;
  background: ${colors.white};
  border-radius: ${({ translateY }) =>
    translateY <= 0 ? '0' : '16px 16px 0 0'};
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(${({ translateY }) => translateY}px);
  transition: ${({ isDragging }) =>
    isDragging ? 'none' : 'transform 0.3s ease-out'};
  z-index: 1050;
`;

const DragHandle = styled.div`
  width: 40px;
  height: 4px;
  background: ${colors.grey400};
  border-radius: 2px;
  margin: 8px auto 0;
`;

const DragArea = styled.div`
  position: relative;
  width: 100%;
  padding: 8px 0;
  touch-action: none;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  &::before {
    content: '';
    position: absolute;
    top: -32px;
    left: 0;
    right: 0;
    bottom: -32px;
  }
`;

const ContentArea = styled(Box)<{ scrollable: boolean }>`
  overflow-y: ${({ scrollable }) => (scrollable ? 'auto' : 'hidden')};
`;

interface Props {
  children: React.ReactNode;
  a11y_panelLabel: string;
  a11y_expandLabel: string;
  a11y_collapseLabel: string;
  expandToFullscreenOn?: string | null;
  inputTerm: InputTerm;
  onCollapse?: () => void;
  onExpand?: () => void;
}

const BottomSheet = ({
  children,
  a11y_panelLabel,
  a11y_expandLabel,
  a11y_collapseLabel,
  expandToFullscreenOn,
  inputTerm,
  onCollapse,
  onExpand,
}: Props) => {
  const { formatMessage } = useIntl();
  // Derive fullscreen state directly from prop - URL is the source of truth
  const isFullscreen = Boolean(expandToFullscreenOn);

  const [isPeeking, setIsPeeking] = useState(false);
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const hasPeeked = useRef(false);
  const hasDragged = useRef(false);
  const touchHandled = useRef(false);

  // Update windowHeight on resize to keep handle position consistent
  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isFullscreen || hasPeeked.current) return;

    const timer = setTimeout(() => {
      setIsPeeking(true);
      hasPeeked.current = true;

      setTimeout(() => {
        setIsPeeking(false);
      }, PEEK_DURATION_MS);
    }, PEEK_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // Reset scroll position when sheet opens to fullscreen
  useEffect(() => {
    if (isFullscreen && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isFullscreen]);

  const getCollapsedY = () => windowHeight - COLLAPSED_HEIGHT;

  const getPeekY = () => windowHeight * 0.5;

  const handleDragStart = (y: number) => {
    dragStartY.current = y;
    hasDragged.current = false;
  };

  const handleDragMove = (currentY: number) => {
    if (dragStartY.current === null) return;

    hasDragged.current = true;
    const delta = currentY - dragStartY.current;
    const baseY = isFullscreen ? 0 : getCollapsedY();
    const maxY = getCollapsedY();
    setDragOffset(Math.max(-baseY, Math.min(maxY - baseY, delta)));
  };

  const handleDragEnd = (endY: number) => {
    if (dragStartY.current === null) return;

    const delta = endY - dragStartY.current;
    const hadDragged = hasDragged.current;

    setDragOffset(null);
    dragStartY.current = null;
    hasDragged.current = false;

    if (hadDragged && Math.abs(delta) >= SWIPE_THRESHOLD) {
      const willBeFullscreen = delta < 0;
      if (willBeFullscreen) {
        onExpand?.();
      } else {
        onCollapse?.();
      }
    } else if (!hadDragged) {
      // Tap detected
      if (isFullscreen) {
        onCollapse?.();
      } else {
        onExpand?.();
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchHandled.current = true;
    handleDragStart(e.touches[0].clientY);
  };
  const handleTouchMove = (e: React.TouchEvent) =>
    handleDragMove(e.touches[0].clientY);
  const handleTouchEnd = (e: React.TouchEvent) =>
    handleDragEnd(e.changedTouches[0].clientY);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (touchHandled.current) {
      touchHandled.current = false;
      return;
    }
    e.preventDefault();
    handleDragStart(e.clientY);

    const onMove = (ev: MouseEvent) => handleDragMove(ev.clientY);
    const onUp = (ev: MouseEvent) => {
      handleDragEnd(ev.clientY);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleCollapse = () => {
    onCollapse?.();
  };

  const baseTranslateY = isFullscreen
    ? 0
    : isPeeking
    ? getPeekY()
    : getCollapsedY();
  const translateY = baseTranslateY + (dragOffset ?? 0);
  const isDragging = dragOffset !== null;

  return (
    <FocusOn
      enabled={isFullscreen}
      autoFocus={true}
      returnFocus={false}
      scrollLock={true}
    >
      <Container
        ref={sheetRef}
        translateY={translateY}
        isDragging={isDragging}
        role="dialog"
        aria-modal={isFullscreen}
        aria-label={a11y_panelLabel}
      >
        <DragArea
          aria-expanded={isFullscreen}
          aria-label={isFullscreen ? a11y_collapseLabel : a11y_expandLabel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <DragHandle aria-hidden="true" />
          {!isFullscreen && (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap="4px"
              py="4px"
              aria-hidden="true"
            >
              <Icon name="search" fill={colors.textSecondary} ml="-28px" />
              <Text
                m="0px"
                p="0px"
                fontSize="s"
                color="textSecondary"
                fontWeight="semi-bold"
              >
                {formatMessage(messages.exploreTags)}
              </Text>
            </Box>
          )}
        </DragArea>

        <ContentArea
          ref={contentRef}
          px="16px"
          pt="24px"
          pb={isFullscreen ? '100px' : '24px'}
          scrollable={isFullscreen}
          h={`calc(100dvh - ${translateY + DRAG_AREA_HEIGHT}px)`}
        >
          {children}
          {isFullscreen && (
            <SeeAllButton inputTerm={inputTerm} onClose={handleCollapse} />
          )}
        </ContentArea>
      </Container>
    </FocusOn>
  );
};

export default BottomSheet;
