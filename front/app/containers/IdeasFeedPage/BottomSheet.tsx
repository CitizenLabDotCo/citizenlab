import React, { useEffect, useRef, useState } from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';
import { FocusOn } from 'react-focus-on';
import styled from 'styled-components';

import { InputTerm } from 'api/phases/types';

import { DragArea, DragHandle } from 'components/UI/Drawer/primitives';
import useSheetDrag from 'components/UI/Drawer/useSheetDrag';

import { useIntl } from 'utils/cl-intl';

import SeeAllButton from './BottomSheet/SeeAllButton';
import messages from './messages';

const COLLAPSED_HEIGHT = 60;
const PEEK_DELAY_MS = 10000;
const PEEK_DURATION_MS = 1000;
const DRAG_AREA_HEIGHT = 28;

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
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  const contentRef = useRef<HTMLDivElement>(null);
  const hasPeeked = useRef(false);

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

  const { dragOffset, isDragging, dragHandlers } = useSheetDrag({
    clampOffset: (delta) => {
      const baseY = isFullscreen ? 0 : getCollapsedY();
      const maxY = getCollapsedY();
      return Math.max(-baseY, Math.min(maxY - baseY, delta));
    },
    onSwipeUp: () => onExpand?.(),
    onSwipeDown: () => onCollapse?.(),
    onTap: () => (isFullscreen ? onCollapse?.() : onExpand?.()),
  });

  const handleCollapse = () => {
    onCollapse?.();
  };

  const baseTranslateY = isFullscreen
    ? 0
    : isPeeking
    ? getPeekY()
    : getCollapsedY();
  const translateY = baseTranslateY + (dragOffset ?? 0);

  return (
    <FocusOn
      enabled={isFullscreen}
      autoFocus={true}
      returnFocus={false}
      scrollLock={true}
    >
      <Container
        translateY={translateY}
        isDragging={isDragging}
        role="dialog"
        aria-modal={isFullscreen}
        aria-label={a11y_panelLabel}
      >
        <DragArea
          aria-expanded={isFullscreen}
          aria-label={isFullscreen ? a11y_collapseLabel : a11y_expandLabel}
          {...dragHandlers}
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
