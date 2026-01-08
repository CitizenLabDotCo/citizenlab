import React, { useState, useRef, useEffect } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { FocusOn } from 'react-focus-on';
import styled from 'styled-components';

const COLLAPSED_HEIGHT = 40;
const DEFAULT_OFFSET = 350;

const Container = styled.div<{ translateY: number; isDragging: boolean }>`
  position: fixed;
  bottom: 0;
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
  height: 100vh;
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
  bottom: 0;
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
  const [sheetState, setSheetState] = useState<SheetState>('default');
  const [dragTranslateY, setDragTranslateY] = useState<number | null>(null);
  const dragStartY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  const sheetContent = (
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
        <DragHandle aria-hidden="true" />
      </DragArea>

      <Box ref={contentRef} px="16px" py="24px" overflowY="auto" h="100%">
        {children}
      </Box>
    </Container>
  );

  return (
    <FocusOn
      enabled={isExpanded}
      autoFocus={true}
      returnFocus={false}
      scrollLock={true}
      onClickOutside={handleClickOutside}
    >
      <Overlay isVisible={isExpanded} onClick={handleClickOutside} />
      {sheetContent}
    </FocusOn>
  );
};

export default BottomSheet;
