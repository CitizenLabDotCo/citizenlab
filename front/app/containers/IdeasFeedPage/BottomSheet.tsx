import React, { useState, useRef, useCallback } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const COLLAPSED_HEIGHT = 60;

const Container = styled.div<{ translateY: number; isDragging: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${colors.white};
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(${({ translateY }) => translateY}px);
  transition: ${({ isDragging }) =>
    isDragging ? 'none' : 'transform 0.3s ease-out'};
  max-height: 80vh;
  z-index: 1020;
`;

const DragHandle = styled.div`
  width: 40px;
  height: 4px;
  background: ${colors.grey400};
  border-radius: 2px;
  margin: 12px auto;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

const DragArea = styled.div`
  padding: 8px 0;
  touch-action: none;
`;

interface Props {
  children: React.ReactNode;
}

const BottomSheet: React.FC<Props> = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const dragStartY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const getSheetHeight = useCallback(() => {
    if (sheetRef.current) {
      return sheetRef.current.offsetHeight;
    }
    return 400;
  }, []);

  const handleDragStart = useCallback(
    (clientY: number) => {
      setIsDragging(true);
      dragStartY.current = clientY;
      const sheetHeight = getSheetHeight();
      const currentTranslateY = isExpanded ? 0 : sheetHeight - COLLAPSED_HEIGHT;
      setTranslateY(currentTranslateY);
    },
    [isExpanded, getSheetHeight]
  );

  const handleDragMove = useCallback(
    (clientY: number) => {
      if (!isDragging) return;

      const deltaY = clientY - dragStartY.current;
      const sheetHeight = getSheetHeight();
      const baseTranslateY = isExpanded ? 0 : sheetHeight - COLLAPSED_HEIGHT;
      const newTranslateY = Math.max(
        0,
        Math.min(sheetHeight - COLLAPSED_HEIGHT, baseTranslateY + deltaY)
      );
      setTranslateY(newTranslateY);
    },
    [isDragging, isExpanded, getSheetHeight]
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    const sheetHeight = getSheetHeight();
    const threshold = sheetHeight * 0.3;

    if (isExpanded) {
      if (translateY > threshold) {
        setIsExpanded(false);
        setTranslateY(sheetHeight - COLLAPSED_HEIGHT);
      } else {
        setTranslateY(0);
      }
    } else {
      if (translateY < sheetHeight - COLLAPSED_HEIGHT - threshold) {
        setIsExpanded(true);
        setTranslateY(0);
      } else {
        setTranslateY(sheetHeight - COLLAPSED_HEIGHT);
      }
    }
  }, [isDragging, isExpanded, translateY, getSheetHeight]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleDragStart(e.touches[0].clientY);
    },
    [handleDragStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      handleDragMove(e.touches[0].clientY);
    },
    [handleDragMove]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleDragStart(e.clientY);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        handleDragMove(moveEvent.clientY);
      };

      const handleMouseUp = () => {
        handleDragEnd();
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [handleDragStart, handleDragMove, handleDragEnd]
  );

  const handleToggle = useCallback(() => {
    const sheetHeight = getSheetHeight();
    if (isExpanded) {
      setTranslateY(sheetHeight - COLLAPSED_HEIGHT);
    } else {
      setTranslateY(0);
    }
    setIsExpanded(!isExpanded);
  }, [isExpanded, getSheetHeight]);

  const sheetHeight = sheetRef.current?.offsetHeight || 400;
  const displayTranslateY = isDragging
    ? translateY
    : isExpanded
    ? 0
    : sheetHeight - COLLAPSED_HEIGHT;

  return (
    <Container
      ref={sheetRef}
      translateY={displayTranslateY}
      isDragging={isDragging}
    >
      <DragArea
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleMouseDown}
        onClick={handleToggle}
      >
        <DragHandle />
      </DragArea>

      <Box
        px="16px"
        pb="24px"
        overflowY="auto"
        style={{ maxHeight: 'calc(80vh - 100px)' }}
      >
        {children}
      </Box>
    </Container>
  );
};

export default BottomSheet;
