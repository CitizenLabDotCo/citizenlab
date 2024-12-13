import React, { useState, useEffect, useCallback } from 'react';

import { useBreakpoint, Title } from '@citizenlab/cl2-component-library';
import useInstanceId from 'component-library/hooks/useInstanceId';
import { debounce } from 'lodash-es';
import { useInView } from 'react-intersection-observer';

import { MiniProjectData } from 'api/projects_mini/types';

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

import { CARD_WIDTH } from './constants';
import LightProjectCard from './LightProjectCard';

interface Props {
  title: string;
  projects: MiniProjectData[];
  hasMore: boolean;
  className?: string;
  onLoadMore: () => Promise<any>;
}

const ProjectCarrousel = ({
  title,
  projects,
  hasMore,
  className,
  onLoadMore,
}: Props) => {
  const [scrollContainerRef, setScrollContainerRef] = useState<
    HTMLDivElement | undefined
  >(undefined);
  const [showPreviousButton, setShowPreviousButton] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [blockLoadMore, setBlockLoadMore] = useState(false);

  const isSmallerThanPhone = useBreakpoint('phone');
  const instanceId = useInstanceId();
  const endId = `end-carrousel-${instanceId}`;

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
          ? (scrollContainerRef.scrollLeft -= CARD_WIDTH + CARD_GAP)
          : (scrollContainerRef.scrollLeft += CARD_WIDTH + CARD_GAP);
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
          {projects.map((project) => (
            <CardContainer key={project.id}>
              <LightProjectCard
                ml={isSmallerThanPhone ? `${CARD_GAP}px` : undefined}
                mr={isSmallerThanPhone ? undefined : `${CARD_GAP}px`}
                project={project}
                onKeyDown={handleKeyDown}
              />
            </CardContainer>
          ))}
          {hasMore && <LoadMoreCard width={CARD_WIDTH} cardRef={ref} />}
        </HorizontalScroll>
        {showPreviousButton && !isSmallerThanPhone && (
          <>
            <ScrollButton
              variant="left"
              top="120px"
              onClick={() => {
                if (!scrollContainerRef) return;
                scrollContainerRef.scrollLeft -= CARD_WIDTH + CARD_GAP;
              }}
            />
            <Gradient variant="left" />
          </>
        )}
        {showNextButton && !isSmallerThanPhone && (
          <>
            <ScrollButton
              variant="right"
              top="120px"
              onClick={() => {
                if (!scrollContainerRef) return;
                scrollContainerRef.scrollLeft += CARD_WIDTH + CARD_GAP;
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

export default ProjectCarrousel;
