import React, { useState } from 'react';

import { useBreakpoint } from '@citizenlab/cl2-component-library';
import useInstanceId from 'component-library/hooks/useInstanceId';
import { useInView } from 'react-intersection-observer';

import { IAdminPublicationData } from 'api/admin_publications/types';

import { CARD_GAP } from '../BaseCarrousel/constants';
import { CardContainer } from '../BaseCarrousel/Containers';
import LoadMoreCard from '../BaseCarrousel/LoadMoreCard';
import ScrollableCarrousel from '../BaseCarrousel/ScrollableCarrousel';
import { skipCarrousel } from '../BaseCarrousel/ScrollableCarrousel/utils';

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
    <ScrollableCarrousel
      className={className}
      title={title}
      scrollContainerRef={scrollContainerRef}
      setScrollContainerRef={setScrollContainerRef}
      cardWidth={cardWidth}
      scrollButtonTop={200}
      hasMore={hasMore}
      endId={endId}
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
    </ScrollableCarrousel>
  );
};

export default AdminPublicationsCarrousel;
