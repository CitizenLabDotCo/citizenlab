import React, { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Spinner,
  useBreakpoint,
  Title,
} from '@citizenlab/cl2-component-library';
import useInstanceId from 'component-library/hooks/useInstanceId';
import { debounce } from 'lodash-es';
import { useInView } from 'react-intersection-observer';

import { CARD_IMAGE_ASPECT_RATIO } from 'api/project_images/useProjectImages';
import { MiniProjectData } from 'api/projects_mini/types';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

import { CarrouselContainer, CardContainer } from '../BaseCarrousel/Containers';
import Gradient from '../BaseCarrousel/Gradient';
import HorizontalScroll from '../BaseCarrousel/HorizontalScroll';
import ScrollButton from '../BaseCarrousel/ScrollButton';
import SkipButton from '../BaseCarrousel/SkipButton';

import { CARD_GAP, CARD_WIDTH } from './constants';
import LightProjectCard from './LightProjectCard';

interface Props {
  title: string;
  projects: MiniProjectData[];
  hasMore: boolean;
  onLoadMore: () => void;
}

const ProjectCarrousel = ({ title, projects, hasMore, onLoadMore }: Props) => {
  const [scrollContainerRef, setScrollContainerRef] = useState<
    HTMLDivElement | undefined
  >(undefined);
  const [showPreviousButton, setShowPreviousButton] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const isSmallerThanPhone = useBreakpoint('phone');
  const instanceId = useInstanceId();
  const endId = `end-carrousel-${instanceId}`;

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasMore) {
        onLoadMore();
      }
    },
  });

  const handleButtonVisiblity = useCallback(
    (ref: HTMLDivElement, hasMore: boolean) => {
      if (isSmallerThanPhone) return;

      const scrollLeft = ref.scrollLeft;
      const scrollWidth = ref.scrollWidth;
      const clientWidth = ref.clientWidth;

      const atEnd = scrollLeft >= scrollWidth - clientWidth;

      if (atEnd && !hasMore) {
        setShowNextButton(false);
      } else {
        setShowNextButton(true);
      }

      const atStart = scrollLeft === 0;
      setShowPreviousButton(!atStart);
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

  const skipCarrousel = () => {
    const element = document.getElementById(endId);
    element?.setAttribute('tabindex', '-1');
    element?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<any>) => {
    if (e.code === 'Escape') {
      skipCarrousel();
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
      <CarrouselContainer>
        <Title
          variant="h3"
          as="h2"
          mt="0px"
          ml={isSmallerThanPhone ? DEFAULT_PADDING : undefined}
        >
          {title}
        </Title>
        <SkipButton onSkip={skipCarrousel} />
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
          {hasMore && (
            <CardContainer>
              <Box
                ref={ref}
                w={`${CARD_WIDTH}px`}
                h={`${CARD_WIDTH / CARD_IMAGE_ASPECT_RATIO}px`}
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <Spinner />
              </Box>
            </CardContainer>
          )}
        </HorizontalScroll>
        {showPreviousButton && !isSmallerThanPhone && (
          <>
            <ScrollButton
              variant="left"
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
