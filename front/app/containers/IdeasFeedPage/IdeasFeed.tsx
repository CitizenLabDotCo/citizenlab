import React, {
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useState,
} from 'react';

import {
  Box,
  Spinner,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import useAddIdeaExposure from 'api/idea_exposure/useAddIdeaExposure';
import useInfiniteIdeaFeedIdeas from 'api/idea_feed/useInfiniteIdeaFeedIdeas';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import StickyNote from './StickyNotes/StickyNote';
import { getTopicColor } from './topicsColor';

const PEEK_HEIGHT_MOBILE = 350;
const PEEK_HEIGHT_DESKTOP = 400;

const FeedContainer = styled(Box)`
  scroll-snap-type: y mandatory;
  overflow-y: auto;
  height: 100vh;

  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const NoteContainer = styled(Box)<{ peekHeight: number; isCentered: boolean }>`
  scroll-snap-align: center;
  scroll-snap-stop: always;
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - ${({ peekHeight }) => peekHeight}px);
  padding: 20px;
  transform: scale(${({ isCentered }) => (isCentered ? 1.08 : 1)});
  transition: transform 0.3s ease;
`;

const VirtualItem = styled.div<{ start: number; topOffset: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  transform: translateY(${(props) => props.start + props.topOffset}px);
`;

interface Props {
  initialIdeaId?: string;
}

const IdeasFeed = ({ initialIdeaId }: Props) => {
  const [searchParams] = useSearchParams();
  const phaseId = searchParams.get('phase_id')!;
  const topicId = searchParams.get('topic');

  const parentRef = useRef<HTMLDivElement | null>(null);
  const currentIndexRef = useRef<number>(0);
  const [centeredIndex, setCenteredIndex] = useState<number>(0);
  const exposedIdeaIdsRef = useRef<Set<string>>(new Set());
  const isMobile = useBreakpoint('phone');

  const handleIdeaSelect = useCallback((ideaId: string | null) => {
    if (ideaId) {
      updateSearchParams({ idea_id: ideaId });
    }
  }, []);

  const { mutate: addIdeaExposure } = useAddIdeaExposure();

  const peekHeight = isMobile ? PEEK_HEIGHT_MOBILE : PEEK_HEIGHT_DESKTOP;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteIdeaFeedIdeas({
      phaseId,
      topic: topicId || undefined,
      'page[size]': 20,
    });

  const flatIdeas = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data]);

  // Reorder ideas to put the clicked idea first
  const orderedIdeas = useMemo(() => {
    if (flatIdeas.length === 0) return [];

    const clickedIndex = flatIdeas.findIndex(
      (idea) => idea.id === initialIdeaId
    );
    if (clickedIndex === -1) return flatIdeas;

    const clickedIdea = flatIdeas[clickedIndex];
    const otherIdeas = [
      ...flatIdeas.slice(0, clickedIndex),
      ...flatIdeas.slice(clickedIndex + 1),
    ];

    return [clickedIdea, ...otherIdeas];
  }, [flatIdeas, initialIdeaId]);

  // Extract topic IDs for each idea
  const ideaTopics = useMemo(() => {
    const map = new Map<string, string[]>();
    orderedIdeas.forEach((idea) => {
      const topicIds =
        idea.relationships.topics?.data.map((topic) => topic.id) || [];
      map.set(idea.id, topicIds);
    });
    return map;
  }, [orderedIdeas]);

  const ideasLength = orderedIdeas.length;

  const itemHeight = window.innerHeight - peekHeight;

  const { getVirtualItems, getTotalSize, measureElement } = useVirtualizer({
    count: hasNextPage ? ideasLength + 1 : ideasLength,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 2,
  });

  const virtualItems = getVirtualItems();

  // Fetch next page when reaching the end
  useEffect(() => {
    if (virtualItems.length === 0) return;
    const lastItem = virtualItems[virtualItems.length - 1];

    if (
      lastItem.index >= ideasLength - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    ideasLength,
    virtualItems,
  ]);

  // Handle scroll events to track current index
  useEffect(() => {
    const container = parentRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const newIndex = Math.round(scrollTop / itemHeight);
      if (
        newIndex !== currentIndexRef.current &&
        newIndex >= 0 &&
        newIndex < ideasLength
      ) {
        currentIndexRef.current = newIndex;
        setCenteredIndex(newIndex);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [ideasLength, itemHeight]);

  // Track idea exposure when a sticky note is focused
  useEffect(() => {
    if (orderedIdeas.length === 0 || centeredIndex >= orderedIdeas.length) {
      return;
    }

    const ideaId = orderedIdeas[centeredIndex].id;
    if (exposedIdeaIdsRef.current.has(ideaId)) return;

    exposedIdeaIdsRef.current.add(ideaId);
    addIdeaExposure({ ideaId });
  }, [centeredIndex, orderedIdeas, addIdeaExposure]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="100vh">
        <Spinner />
      </Box>
    );
  }

  if (orderedIdeas.length === 0) {
    return null;
  }

  // Add top padding so the first note is centered (half of peek height)
  const topPadding = peekHeight / 2;

  return (
    <FeedContainer ref={parentRef}>
      <Box
        height={`${getTotalSize() + topPadding}px`}
        width="100%"
        position="relative"
      >
        {virtualItems.map((virtualRow) => {
          const isLoaderRow = virtualRow.index > orderedIdeas.length - 1;
          const idea = orderedIdeas[virtualRow.index];

          if (isLoaderRow) {
            return (
              <VirtualItem
                key="loader"
                start={virtualRow.start}
                topOffset={topPadding}
                data-index={virtualRow.index}
                ref={measureElement}
              >
                <NoteContainer peekHeight={peekHeight} isCentered={false}>
                  <Spinner />
                </NoteContainer>
              </VirtualItem>
            );
          }

          const topicIds = ideaTopics.get(idea.id) || [];
          const topicBackgroundColor = topicId
            ? getTopicColor(topicId)
            : getTopicColor(topicIds[0]);

          return (
            <VirtualItem
              key={idea.id}
              start={virtualRow.start}
              topOffset={topPadding}
              data-index={virtualRow.index}
              ref={measureElement}
            >
              <NoteContainer
                peekHeight={peekHeight}
                bgColor={colors.grey100}
                isCentered={virtualRow.index === centeredIndex}
              >
                <StickyNote
                  ideaId={idea.id}
                  topicBackgroundColor={topicBackgroundColor}
                  size="large"
                  onClick={() => handleIdeaSelect(idea.id)}
                />
              </NoteContainer>
            </VirtualItem>
          );
        })}
      </Box>
    </FeedContainer>
  );
};

export default IdeasFeed;
