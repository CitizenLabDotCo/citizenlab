import React, { useState, useEffect, useCallback } from 'react';

import { useBreakpoint, Title } from '@citizenlab/cl2-component-library';
import useInstanceId from 'component-library/hooks/useInstanceId';
import { debounce } from 'lodash-es';
import { useInView } from 'react-intersection-observer';

import { IAdminPublicationData } from 'api/admin_publications/types';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

import { CARD_GAP } from '../BaseCarrousel/constants';
import { CarrouselContainer, CardContainer } from '../BaseCarrousel/Containers';
import Gradient from '../BaseCarrousel/Gradient';
import HorizontalScroll from '../BaseCarrousel/HorizontalScroll';
import LoadMoreCard from '../BaseCarrousel/LoadMoreCard';
import ScrollButton from '../BaseCarrousel/ScrollButton';
import SkipButton from '../BaseCarrousel/SkipButton';
import {
  getUpdatedButtonVisibility,
  skipCarrousel,
} from '../BaseCarrousel/utils';

import AdminPublicationCard from './AdminPublicationCard';
import { BIG_CARD_WIDTH, SMALL_CARD_WIDTH } from './constants';

interface Props {
  title: string;
  adminPublications: IAdminPublicationData[];
  hasMore: boolean;
  className?: string;
  onLoadMore: () => Promise<any>;
}

const AdminPublicationsCarrousel = ({
  title,
  adminPublications,
  hasMore,
  className,
  onLoadMore,
}: Props) => {
  const [scrollContainerRef, setScrollContainerRef] = useState<
    HTMLDivElement | undefined
  >(undefined);
  // State related to 'previous' button
  const [showPreviousButton, setShowPreviousButton] = useState(false);
  const [mouseOverPreviousButton, setMouseOverPreviousButton] = useState(false);
  const [
    previousButtonShouldDisappearAfterMouseMove,
    setPreviousButtonShouldDisappearAfterMouseMove,
  ] = useState(false);

  // State related to 'next' button
  const [showNextButton, setShowNextButton] = useState(false);
  const [mouseOverNextButton, setMouseOverNextButton] = useState(false);
  const [
    nextButtonShouldDisappearAfterMouseMove,
    setNextButtonShouldDisappearAfterMouseMove,
  ] = useState(false);

  const [blockLoadMore, setBlockLoadMore] = useState(false);

  const isSmallerThanPhone = useBreakpoint('phone');
  const instanceId = useInstanceId();
  const endId = `end-carrousel-${instanceId}`;
  const cardWidth = isSmallerThanPhone ? SMALL_CARD_WIDTH : BIG_CARD_WIDTH;

  const handleLoadMore = async () => {
    setBlockLoadMore(true);
    await onLoadMore();
    setBlockLoadMore(false);
  };

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasMore && !blockLoadMore) {
        handleLoadMore();
      }
    },
  });

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
    },
    [isSmallerThanPhone, mouseOverPreviousButton, mouseOverNextButton]
  );

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

  const handleKeyDown = (e: React.KeyboardEvent<any>) => {
    if (e.code === 'Escape') {
      skipCarrousel(endId);
    }

    if (e.code === 'Tab' && scrollContainerRef) {
      setTimeout(() => {
        e.shiftKey
          ? (scrollContainerRef.scrollLeft -= cardWidth + CARD_GAP)
          : (scrollContainerRef.scrollLeft += cardWidth + CARD_GAP);
      }, 50);
    }
  };

  return (
    <>
      <CarrouselContainer className={className}>
        <Title
          variant="h2"
          mt="0px"
          ml={isSmallerThanPhone ? DEFAULT_PADDING : undefined}
          color="tenantText"
        >
          {title}
        </Title>
        <SkipButton onSkip={() => skipCarrousel(endId)} />
        <HorizontalScroll
          setRef={(ref) => {
            if (ref) {
              setScrollContainerRef(ref);
              handleButtonVisiblity(ref, hasMore);
            }
          }}
        >
          {adminPublications.map((adminPublication) => (
            <CardContainer key={adminPublication.id}>
              <AdminPublicationCard
                ml={isSmallerThanPhone ? `${CARD_GAP}px` : undefined}
                mr={isSmallerThanPhone ? undefined : `${CARD_GAP}px`}
                adminPublication={adminPublication}
                onKeyDown={handleKeyDown}
              />
            </CardContainer>
          ))}
          {hasMore && <LoadMoreCard width={cardWidth} cardRef={ref} />}
        </HorizontalScroll>
        {showPreviousButton && !isSmallerThanPhone && (
          <>
            <ScrollButton
              variant="left"
              top="200px"
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
            <Gradient variant="left" />
          </>
        )}
        {showNextButton && !isSmallerThanPhone && (
          <>
            <ScrollButton
              variant="right"
              top="200px"
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
            <Gradient variant="right" />
          </>
        )}
      </CarrouselContainer>
      <i id={endId} />
    </>
  );
};

export default AdminPublicationsCarrousel;
