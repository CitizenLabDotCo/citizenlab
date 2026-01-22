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
const DRAG_AREA_HEIGHT = 28;
const SWIPE_THRESHOLD = 50;
const LONG_SWIPE_THRESHOLD = 200;

const Container = styled.div<{ $translateY: number; $isDragging: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100svh;
  background: ${colors.white};
  border-radius: ${({ $translateY }) =>
    $translateY <= 0 ? '0' : '16px 16px 0 0'};
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(${({ $translateY }) => $translateY}px);
  transition: ${({ $isDragging }) =>
    $isDragging ? 'none' : 'transform 0.3s ease-out'};
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
  width: 100%;
  padding: 8px 0;
`;

const Overlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 1040;
  pointer-events: ${({ $isVisible }) => ($isVisible ? 'auto' : 'none')};
`;

const ContentArea = styled(Box)<{ $scrollable: boolean }>`
  overflow-y: ${({ $scrollable }) => ($scrollable ? 'auto' : 'hidden')};
`;

interface Props {
  children: React.ReactNode;
  a11y_panelLabel: string;
  a11y_expandLabel: string;
  a11y_collapseLabel: string;
  expandToFullscreenOn?: string | null;
}

type SheetState = 'collapsed' | 'default' | 'fullscreen';

const getNextState = (
  current: SheetState,
  direction: 'up' | 'down',
  isLongSwipe: boolean
): SheetState => {
  if (direction === 'up') {
    return current === 'collapsed' && !isLongSwipe ? 'default' : 'fullscreen';
  }
  return current === 'fullscreen' && !isLongSwipe ? 'default' : 'collapsed';
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
  const [dragOffset, setDragOffset] = useState<number | null>(null);

  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragAreaRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    startY: null as number | null,
    startScrollTop: 0,
    startedInHandle: false,
    isDraggingContent: false,
  });

  useEffect(() => {
    if (sheetState !== 'collapsed') return;

    const timer = setTimeout(() => {
      setShowNudge(true);
    }, NUDGE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [sheetState]);

  useEffect(() => {
    if (expandToFullscreenOn) {
      setSheetState('fullscreen');
      contentRef.current?.scrollTo(0, 0);
    }
  }, [expandToFullscreenOn]);

  const getSheetHeight = () =>
    sheetRef.current?.offsetHeight ?? window.innerHeight;

  const getTranslateY = (state: SheetState) => {
    if (state === 'fullscreen') return 0;
    if (state === 'default') return DEFAULT_OFFSET;
    return getSheetHeight() - COLLAPSED_HEIGHT;
  };

  const canDragSheet = (direction: 'up' | 'down') => {
    const { startedInHandle, startScrollTop } = dragState.current;

    // Drag handle always allows dragging
    if (startedInHandle) return true;

    // Only check scroll when fullscreen
    if (sheetState !== 'fullscreen') return true;

    const scrollTop = contentRef.current?.scrollTop ?? 0;
    const content = contentRef.current;
    const hasScrollableContent =
      content && content.scrollHeight > content.clientHeight;

    // If content was/is scrolled, or swiping up with scrollable content, let content handle it
    if (startScrollTop > 0 || scrollTop > 0) return false;
    if (direction === 'up' && hasScrollableContent) return false;

    return true;
  };

  const handleDragStart = (y: number, target: EventTarget | null) => {
    dragState.current = {
      startY: y,
      startScrollTop: contentRef.current?.scrollTop ?? 0,
      startedInHandle: dragAreaRef.current?.contains(target as Node) ?? false,
      isDraggingContent: false,
    };
  };

  const handleDragMove = (currentY: number) => {
    const { startY, isDraggingContent } = dragState.current;
    if (startY === null || isDraggingContent) return;

    const delta = currentY - startY;
    const direction = delta < 0 ? 'up' : 'down';

    if (!canDragSheet(direction)) {
      dragState.current.isDraggingContent = true;
      return;
    }

    const baseY = getTranslateY(sheetState);
    const maxY = getSheetHeight() - COLLAPSED_HEIGHT;
    setDragOffset(Math.max(-baseY, Math.min(maxY - baseY, delta)));
  };

  const handleDragEnd = (endY: number) => {
    const { startY, isDraggingContent } = dragState.current;
    if (startY === null) return;

    const delta = endY - startY;
    setDragOffset(null);
    dragState.current.startY = null;

    if (isDraggingContent || Math.abs(delta) < SWIPE_THRESHOLD) {
      dragState.current.isDraggingContent = false;
      return;
    }

    const direction = delta < 0 ? 'up' : 'down';
    const isLongSwipe = Math.abs(delta) >= LONG_SWIPE_THRESHOLD;
    const newState = getNextState(sheetState, direction, isLongSwipe);

    setSheetState(newState);
    if (newState === 'fullscreen') {
      contentRef.current?.scrollTo(0, 0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) =>
    handleDragStart(e.touches[0].clientY, e.target);
  const handleTouchMove = (e: React.TouchEvent) =>
    handleDragMove(e.touches[0].clientY);
  const handleTouchEnd = (e: React.TouchEvent) =>
    handleDragEnd(e.changedTouches[0].clientY);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY, e.target);

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
    if (sheetState !== 'collapsed') {
      setSheetState('collapsed');
    }
  };

  const baseTranslateY = getTranslateY(sheetState);
  const translateY = baseTranslateY + (dragOffset ?? 0);
  const isDragging = dragOffset !== null;
  const isExpanded = sheetState !== 'collapsed';
  const isFullscreen = sheetState === 'fullscreen';

  return (
    <FocusOn
      enabled={isExpanded}
      autoFocus={true}
      returnFocus={false}
      scrollLock={true}
      onClickOutside={handleCollapse}
    >
      <Overlay $isVisible={isExpanded} onClick={handleCollapse} />
      <Container
        ref={sheetRef}
        $translateY={translateY}
        $isDragging={isDragging}
        role="dialog"
        aria-modal={isExpanded}
        aria-label={a11y_panelLabel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
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
          $scrollable={isFullscreen}
          h={`calc(100svh - ${translateY + DRAG_AREA_HEIGHT}px)`}
        >
          {children}
        </ContentArea>
      </Container>
    </FocusOn>
  );
};

export default BottomSheet;
