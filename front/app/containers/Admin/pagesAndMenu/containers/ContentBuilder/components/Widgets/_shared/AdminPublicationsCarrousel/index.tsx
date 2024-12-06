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
  onLoadMore: () => Promise<any>;
}

const AdminPublicationsCarrousel = ({
  title,
  adminPublications,
  hasMore,
  onLoadMore,
}: Props) => {
  const [scrollContainerRef, setScrollContainerRef] = useState<
    HTMLDivElement | undefined
  >(undefined);
  const [showPreviousButton, setShowPreviousButton] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const isSmallerThanPhone = useBreakpoint('phone');
  const instanceId = useInstanceId();
  const endId = `end-carrousel-${instanceId}`;
  const cardWidth = isSmallerThanPhone ? SMALL_CARD_WIDTH : BIG_CARD_WIDTH;

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await onLoadMore();
    setTimeout(() => {
      setIsLoadingMore(false);
    }, 2000);
  };

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasMore && !isLoadingMore) {
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

      setShowNextButton(showNextButton);
      setShowPreviousButton(showPreviousButton);
    },
    [isSmallerThanPhone]
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
      <CarrouselContainer>
        <Title
          variant="h3"
          as="h2"
          mt="0px"
          ml={isSmallerThanPhone ? DEFAULT_PADDING : undefined}
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
