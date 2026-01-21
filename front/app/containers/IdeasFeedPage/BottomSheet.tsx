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

const Container = styled.div<{ translateY: number; isDragging: boolean }>`
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
  transition: ${({ isDragging }) =>
    isDragging ? 'none' : 'transform 0.3s ease-out'};
  height: 100svh;
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
  position: relative;
  display: block;
  width: 100%;
  padding: 8px 0;
  touch-action: none;
  background: none;
  border: none;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
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

interface Props {
  children: React.ReactNode;
  a11y_panelLabel: string;
  a11y_expandLabel: string;
  a11y_collapseLabel: string;
  /** When this value changes (and is truthy), the sheet expands to fullscreen */
  expandToFullscreenOn?: string | null;
}

type SheetState = 'collapsed' | 'default' | 'fullscreen';

const BottomSheet = ({
  children,
  a11y_panelLabel,
  a11y_expandLabel,
  a11y_collapseLabel,
  expandToFullscreenOn,
}: Props) => {
  const { formatMessage } = useIntl();
  const [sheetState, setSheetState] = useState<SheetState>('collapsed');
  const [dragTranslateY, setDragTranslateY] = useState<number | null>(null);
  const [showNudge, setShowNudge] = useState(false);
  const dragStartY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  const startDrag = (startY: number) => {
    dragStartY.current = startY;
    setDragTranslateY(getTranslateYForState(sheetState));
  };

  const updateDrag = (currentY: number) => {
    const delta = currentY - dragStartY.current;
    const base = getTranslateYForState(sheetState);
    const max = getSheetHeight() - COLLAPSED_HEIGHT;
    setDragTranslateY(Math.max(0, Math.min(max, base + delta)));
  };

  const endDrag = () => {
    if (dragTranslateY === null) return;
    const collapsedY = getSheetHeight() - COLLAPSED_HEIGHT;
    const newState: SheetState =
      dragTranslateY <= DEFAULT_OFFSET / 2
        ? 'fullscreen'
        : dragTranslateY <= (DEFAULT_OFFSET + collapsedY) / 2
        ? 'default'
        : 'collapsed';
    setSheetState(newState);
    setDragTranslateY(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startDrag(e.clientY);
    const onMove = (ev: MouseEvent) => updateDrag(ev.clientY);
    const onUp = () => {
      endDrag();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const isDragging = dragTranslateY !== null;
  const translateY = isDragging
    ? dragTranslateY
    : getTranslateYForState(sheetState);
  const isExpanded = sheetState !== 'collapsed';

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
        isDragging={isDragging}
        role="dialog"
        aria-modal={isExpanded}
        aria-label={a11y_panelLabel}
      >
        <DragArea
          onTouchStart={(e) => startDrag(e.touches[0].clientY)}
          onTouchMove={(e) => updateDrag(e.touches[0].clientY)}
          onTouchEnd={endDrag}
          onMouseDown={handleMouseDown}
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

        <Box
          ref={contentRef}
          px="16px"
          py="24px"
          overflowY="auto"
          h={`calc(100svh - ${translateY + DRAG_AREA_HEIGHT}px)`}
        >
          {children}
        </Box>
      </Container>
    </FocusOn>
  );
};

export default BottomSheet;
