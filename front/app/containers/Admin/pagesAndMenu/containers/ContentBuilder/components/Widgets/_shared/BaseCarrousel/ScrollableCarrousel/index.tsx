import React, { useState, useCallback, useEffect } from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';

import { CARD_GAP } from '../constants';

import Gradient from './Gradient';
import HorizontalScroll from './HorizontalScroll';
import ScrollButton from './ScrollButton';
import SkipButton from './SkipButton';
import { getUpdatedButtonVisibility, skipCarrousel } from './utils';

interface Props {
  scrollContainerRef?: HTMLDivElement;
  setScrollContainerRef: (instance: HTMLDivElement) => void;
  cardWidth: number;
  hasMore: boolean;
  endId: string;
  children: React.ReactNode;
}

const ScrollableCarrousel = ({
  scrollContainerRef,
  setScrollContainerRef,
  cardWidth,
  hasMore,
  endId,
  children,
}: Props) => {
  // State related to 'previous' button
  const [showPreviousButton, setShowPreviousButton] = useState(false);
  const [showPreviousGradient, setShowPreviousGradient] = useState(false);
  const [mouseOverPreviousButton, setMouseOverPreviousButton] = useState(false);
  const [
    previousButtonShouldDisappearAfterMouseMove,
    setPreviousButtonShouldDisappearAfterMouseMove,
  ] = useState(false);

  // State related to 'next' button
  const [showNextButton, setShowNextButton] = useState(false);
  const [showNextGradient, setShowNextGradient] = useState(false);
  const [mouseOverNextButton, setMouseOverNextButton] = useState(false);
  const [
    nextButtonShouldDisappearAfterMouseMove,
    setNextButtonShouldDisappearAfterMouseMove,
  ] = useState(false);

  const isSmallerThanPhone = useBreakpoint('phone');

  const handleButtonVisiblity = useCallback(
    (ref: HTMLDivElement, hasMore: boolean) => {
      if (isSmallerThanPhone) return;
      const { showNextButton, showPreviousButton } = getUpdatedButtonVisibility(
        ref,
        hasMore
      );

      if (!mouseOverPreviousButton) {
        setShowPreviousButton(showPreviousButton);
      } else {
        setPreviousButtonShouldDisappearAfterMouseMove(true);
      }

      if (!mouseOverNextButton) {
        setShowNextButton(showNextButton);
      } else {
        setNextButtonShouldDisappearAfterMouseMove(true);
      }

      setShowPreviousGradient(showPreviousButton);
      setShowNextGradient(showNextButton);
    },
    [isSmallerThanPhone, mouseOverPreviousButton, mouseOverNextButton]
  );

  // Set button visiblity on scroll
  useEffect(() => {
    if (!scrollContainerRef) return;

    const handler = debounce(() => {
      handleButtonVisiblity(scrollContainerRef, hasMore);
    }, 100);

    scrollContainerRef.addEventListener('scroll', handler);

    return () => {
      scrollContainerRef.removeEventListener('scroll', handler);
    };
  }, [scrollContainerRef, hasMore, handleButtonVisiblity]);

  return (
    <Box position="relative">
      <SkipButton onSkip={() => skipCarrousel(endId)} />
      <HorizontalScroll
        setRef={(ref) => {
          if (ref) {
            setScrollContainerRef(ref);
            handleButtonVisiblity(ref, hasMore);
          }
        }}
      >
        {children}
      </HorizontalScroll>
      {!isSmallerThanPhone && (
        <>
          {showPreviousButton && (
            <ScrollButton
              variant="left"
              onClick={() => {
                if (!scrollContainerRef) return;
                scrollContainerRef.scrollLeft -= cardWidth + CARD_GAP;
              }}
              onMouseEnter={() => setMouseOverPreviousButton(true)}
              onMouseLeave={() => {
                setMouseOverPreviousButton(false);
                if (previousButtonShouldDisappearAfterMouseMove) {
                  setShowPreviousButton(false);
                  setPreviousButtonShouldDisappearAfterMouseMove(false);
                }
              }}
            />
          )}
          {showPreviousGradient && <Gradient variant="left" />}
        </>
      )}
      {!isSmallerThanPhone && (
        <>
          {showNextButton && (
            <ScrollButton
              variant="right"
              onClick={() => {
                if (!scrollContainerRef) return;
                scrollContainerRef.scrollLeft += cardWidth + CARD_GAP;
              }}
              onMouseEnter={() => setMouseOverNextButton(true)}
              onMouseLeave={() => {
                setMouseOverNextButton(false);
                if (nextButtonShouldDisappearAfterMouseMove) {
                  setShowNextButton(false);
                  setNextButtonShouldDisappearAfterMouseMove(false);
                }
              }}
            />
          )}
          {showNextGradient && <Gradient variant="right" />}
        </>
      )}
      <i id={endId} />
    </Box>
  );
};

export default ScrollableCarrousel;
