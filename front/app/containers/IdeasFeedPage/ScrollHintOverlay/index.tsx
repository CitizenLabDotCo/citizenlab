import React, { useState, useCallback, useRef } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import Lottie from 'lottie-react';
import styled from 'styled-components';

const scrollHintAnimation = require('./animations/scroll-hint.json');

const SCROLL_HINT_SEEN_KEY = 'ideas_feed_scroll_hint_seen';
const SWIPE_THRESHOLD = 30;

const Overlay = styled(Box)<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
  transition: opacity 0.3s ease-out;
`;

const AnimationContainer = styled(Box)`
  width: 500px;
  height: 500px;
`;

const getHasSeenHint = () => {
  try {
    return localStorage.getItem(SCROLL_HINT_SEEN_KEY) === 'true';
  } catch {
    return false;
  }
};

const setHasSeenHint = () => {
  try {
    localStorage.setItem(SCROLL_HINT_SEEN_KEY, 'true');
  } catch {
    // Ignore localStorage errors
  }
};

export const useScrollHint = () => {
  const [isVisible, setIsVisible] = useState(() => !getHasSeenHint());

  const dismiss = useCallback(() => {
    setIsVisible(false);
    setHasSeenHint();
  }, []);

  return { isVisible, dismiss };
};

const ScrollHintOverlay = () => {
  const { isVisible, dismiss } = useScrollHint();
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartY.current === null) return;

      const touchEndY = e.changedTouches[0].clientY;
      const delta = Math.abs(touchEndY - touchStartY.current);

      if (delta >= SWIPE_THRESHOLD) {
        dismiss();
      }

      touchStartY.current = null;
    },
    [dismiss]
  );

  return (
    <Overlay
      isVisible={isVisible}
      onClick={dismiss}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimationContainer>
        <Lottie animationData={scrollHintAnimation} loop={true} />
      </AnimationContainer>
    </Overlay>
  );
};

export default ScrollHintOverlay;
