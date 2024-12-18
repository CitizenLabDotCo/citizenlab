import React, { useState } from 'react';

import { useBreakpoint } from '@citizenlab/cl2-component-library';
import useInstanceId from 'component-library/hooks/useInstanceId';
import { useInView } from 'react-intersection-observer';

import { MiniProjectData } from 'api/projects_mini/types';

import { CARD_GAP } from '../BaseCarrousel/constants';
import { CardContainer } from '../BaseCarrousel/Containers';
import LoadMoreCard from '../BaseCarrousel/LoadMoreCard';
import ScrollableCarrousel from '../BaseCarrousel/ScrollableCarrousel';
import { skipCarrousel } from '../BaseCarrousel/ScrollableCarrousel/utils';

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
    <ScrollableCarrousel
      className={className}
      title={title}
      scrollContainerRef={scrollContainerRef}
      setScrollContainerRef={setScrollContainerRef}
      cardWidth={CARD_WIDTH}
      scrollButtonTop={120}
      hasMore={hasMore}
      endId={endId}
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
    </ScrollableCarrousel>
  );
};

export default ProjectCarrousel;
