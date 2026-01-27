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
const NUDGE_DELAY_MS = 5000;
const DRAG_AREA_HEIGHT = 28;
const SWIPE_THRESHOLD = 50;

const Container = styled.div<{ $translateY: number; $isDragging: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100dvh;
  background: ${colors.white};
  border-radius: ${({ $translateY }) =>
    $translateY <= 0 ? '0' : '16px 16px 0 0'};
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(${({ $translateY }) => $translateY}px);
  transition: ${({ $isDragging }) =>
    $isDragging ? 'none' : 'transform 0.3s ease-out'};
  z-index: 1050;
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
  touch-action: none;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
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

const BottomSheet = ({
  children,
  a11y_panelLabel,
  a11y_expandLabel,
  a11y_collapseLabel,
  expandToFullscreenOn,
}: Props) => {
  const { formatMessage } = useIntl();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [dragOffset, setDragOffset] = useState<number | null>(null);

  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const hasShownNudge = useRef(false);

  useEffect(() => {
    if (isFullscreen || hasShownNudge.current) return;

    const timer = setTimeout(() => {
      setShowNudge(true);
      hasShownNudge.current = true;
    }, NUDGE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  useEffect(() => {
    if (expandToFullscreenOn) {
      setIsFullscreen(true);
    } else {
      setIsFullscreen(false);
    }
  }, [expandToFullscreenOn]);

  const getCollapsedY = () =>
    (sheetRef.current?.offsetHeight ?? window.innerHeight) - COLLAPSED_HEIGHT;

  const handleDragStart = (y: number) => {
    dragStartY.current = y;
    setShowNudge(false);
  };

  const handleDragMove = (currentY: number) => {
    if (dragStartY.current === null) return;

    const delta = currentY - dragStartY.current;
    const baseY = isFullscreen ? 0 : getCollapsedY();
    const maxY = getCollapsedY();
    setDragOffset(Math.max(-baseY, Math.min(maxY - baseY, delta)));
  };

  const handleDragEnd = (endY: number) => {
    if (dragStartY.current === null) return;

    const delta = endY - dragStartY.current;
    const hadOffset = dragOffset !== null;

    setDragOffset(null);
    dragStartY.current = null;

    if (hadOffset && Math.abs(delta) >= SWIPE_THRESHOLD) {
      setIsFullscreen(delta < 0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) =>
    handleDragStart(e.touches[0].clientY);
  const handleTouchMove = (e: React.TouchEvent) =>
    handleDragMove(e.touches[0].clientY);
  const handleTouchEnd = (e: React.TouchEvent) =>
    handleDragEnd(e.changedTouches[0].clientY);

  const handleMouseDown = (e: React.MouseEvent) => {
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

  const baseTranslateY = isFullscreen ? 0 : getCollapsedY();
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
        $translateY={translateY}
        $isDragging={isDragging}
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
          <Tooltip
            content={
              <Box display="flex" alignItems="center" gap="8px">
                <Icon name="stars" fill={colors.orange500} />
                <Text color="textPrimary" fontSize="s" m="0px">
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
          px="16px"
          py="24px"
          $scrollable={isFullscreen}
          h={`calc(100dvh - ${translateY + DRAG_AREA_HEIGHT}px)`}
        >
          {children}
        </ContentArea>
      </Container>
    </FocusOn>
  );
};

export default BottomSheet;
