import React, { useState, useEffect, useCallback } from 'react';

import {
  Title,
  Box,
  Spinner,
  Icon,
  colors,
} from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';

import { CARD_IMAGE_ASPECT_RATIO } from 'api/project_images/useProjectImages';
import { IProjectData } from 'api/projects/types';

import { CARD_GAP, CARD_WIDTH } from './constants';
import HorizontalScroll from './HorizontalScroll';
import LightProjectCard from './LightProjectCard';

const Container = styled(Box)`
  .scroll-button {
    opacity: 0;
    transition: opacity 0.3s;
    cursor: pointer;
  }

  &:hover {
    .scroll-button {
      opacity: 1;
    }
  }
`;

const ProjectContainer = styled.div`
  scroll-snap-align: start;
`;

interface Props {
  title: string;
  projects: IProjectData[];
  hasMore: boolean;
  onLoadMore: () => void;
}

const ProjectCarrousel = ({ title, projects, hasMore, onLoadMore }: Props) => {
  const [scrollContainerRef, setScrollContainerRef] = useState<
    HTMLDivElement | undefined
  >(undefined);
  const [showPreviousButton, setShowPreviousButton] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasMore) {
        onLoadMore();
      }
    },
  });

  const handleButtonVisiblity = useCallback(
    (ref: HTMLDivElement, hasMore: boolean) => {
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
    []
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

  return (
    <Container position="relative">
      <Title variant="h3" as="h2" mt="0px">
        {title}
      </Title>
      <HorizontalScroll
        setRef={(ref) => {
          if (ref) {
            setScrollContainerRef(ref);
            handleButtonVisiblity(ref, hasMore);
          }
        }}
      >
        {projects.map((project) => (
          <ProjectContainer key={project.id}>
            <LightProjectCard project={project} />
          </ProjectContainer>
        ))}
        {hasMore && (
          <ProjectContainer>
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
          </ProjectContainer>
        )}
      </HorizontalScroll>
      {showPreviousButton && (
        <Box
          as="button"
          className="scroll-button"
          position="absolute"
          left="8px"
          top="120px"
          borderRadius="30px"
          bgColor="white"
          w="52px"
          h="52px"
          border={`1px solid ${colors.divider}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!scrollContainerRef) return;
            scrollContainerRef.scrollLeft -= CARD_WIDTH + CARD_GAP;
          }}
        >
          <Icon name="arrow-left" fill={colors.grey700} />
        </Box>
      )}
      {showNextButton && (
        <Box
          as="button"
          className="scroll-button"
          position="absolute"
          right="8px"
          top="120px"
          borderRadius="30px"
          bgColor="white"
          w="52px"
          h="52px"
          border={`1px solid ${colors.divider}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!scrollContainerRef) return;
            scrollContainerRef.scrollLeft += CARD_WIDTH + CARD_GAP;
          }}
        >
          <Icon name="arrow-right" fill={colors.grey700} />
        </Box>
      )}
    </Container>
  );
};

export default ProjectCarrousel;
