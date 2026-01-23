import React, {
  useMemo,
  useRef,
  useCallback,
  useState,
  useEffect,
} from 'react';

import {
  Box,
  Spinner,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useVirtualizer } from '@tanstack/react-virtual';
import { uniqBy } from 'lodash-es';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import useInfiniteIdeaFeedIdeas from 'api/idea_feed/useInfiniteIdeaFeedIdeas';
import useIdeaById from 'api/ideas/useIdeaById';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import StickyNote, { NOTE_HEIGHTS } from './StickyNotes/StickyNote';
import { getTopicColor } from './topicsColor';

const PEEK_HEIGHT = 150;

const FeedContainer = styled(Box)`
  scroll-snap-type: y mandatory;
  overflow-y: auto;
  height: 100svh;

  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const NoteContainer = styled(Box)<{
  peekHeight: number;
  isCentered: boolean;
  isPrevious: boolean;
  isNext: boolean;
  noteHeight: number;
}>`
  position: relative;
  display: flex;
  justify-content: center;
  scroll-snap-align: center;
  scroll-snap-stop: always;
  height: calc(100svh - ${({ peekHeight }) => peekHeight}px);
  padding: 30px;

  > * {
    position: absolute;
    top: ${({ isCentered, isPrevious, isNext, peekHeight, noteHeight }) => {
      const containerHeight = `calc(100svh - ${peekHeight}px - 40px)`;
      if (isCentered) {
        return `calc((${containerHeight} - ${noteHeight}px) / 2)`;
      }
      if (isNext) {
        return '0px';
      }
      if (isPrevious) {
        return `calc(${containerHeight} - ${noteHeight}px)`;
      }
      return `calc((${containerHeight} - ${noteHeight}px) / 2)`;
    }};
    transform: scale(${({ isCentered }) => (isCentered ? 1.08 : 1)});
    opacity: ${({ isCentered }) => (isCentered ? 1 : 0.5)};
    pointer-events: ${({ isCentered }) => (isCentered ? 'auto' : 'none')};
    transition: top 0.4s ease-out, transform 0.4s ease-out,
      opacity 0.4s ease-out;
  }
`;

const VirtualItem = styled.div<{ start: number; topOffset: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  transform: translateY(${(props) => props.start + props.topOffset}px);
`;

interface Props {
  topicId?: string | null;
  parentTopicId?: string | null;
}

const IdeasFeed = ({ topicId, parentTopicId }: Props) => {
  const [searchParams] = useSearchParams();
  const phaseId = searchParams.get('phase_id')!;
  const initialIdeaId = searchParams.get('initial_idea_id') || undefined;

  const parentRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useBreakpoint('phone');

  const handleIdeaSelect = useCallback((ideaId: string | null) => {
    if (ideaId) {
      updateSearchParams({ idea_id: ideaId });
    }
  }, []);

  const noteSize = isMobile ? 'small' : 'large';
  const noteHeight = NOTE_HEIGHTS[noteSize];

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteIdeaFeedIdeas({
      phaseId,
      topic: topicId || undefined,
      'page[size]': 10,
      keepPreviousData: topicId ? false : true,
    });

  const flatIdeas = useMemo(() => {
    if (!data) return [];
    const allIdeas = data.pages.flatMap((page) => page.data);
    return uniqBy(allIdeas, 'id');
  }, [data]);

  // Check if initial idea is already in the list
  const initialIdeaInList = useMemo(() => {
    if (!initialIdeaId) return true;
    return flatIdeas.some((idea) => idea.id === initialIdeaId);
  }, [flatIdeas, initialIdeaId]);

  // Fetch the initial idea separately if it's not in the list
  const { data: initialIdeaData, isFetching: isFetchingInitialIdea } =
    useIdeaById(initialIdeaInList ? undefined : initialIdeaId);

  // Reorder ideas to put the initial idea first (if provided), otherwise keep original order
  const orderedIdeas = useMemo(() => {
    // If we need to fetch the initial idea and it's loaded, prepend it
    if (initialIdeaId && !initialIdeaInList && initialIdeaData) {
      return [initialIdeaData.data, ...flatIdeas];
    }

    if (flatIdeas.length === 0 || !initialIdeaId) return flatIdeas;

    const initialIndex = flatIdeas.findIndex(
      (idea) => idea.id === initialIdeaId
    );
    if (initialIndex === -1) return flatIdeas;

    const initialIdea = flatIdeas[initialIndex];
    const otherIdeas = [
      ...flatIdeas.slice(0, initialIndex),
      ...flatIdeas.slice(initialIndex + 1),
    ];

    return [initialIdea, ...otherIdeas];
  }, [flatIdeas, initialIdeaId, initialIdeaInList, initialIdeaData]);

  // Remove initial_idea_id from URL once the feed has loaded with the initial idea
  useEffect(() => {
    if (initialIdeaId && orderedIdeas.length > 0 && !isLoading) {
      removeSearchParams(['initial_idea_id']);
    }
  }, [initialIdeaId, orderedIdeas.length, isLoading]);

  // Extract topic IDs for each idea
  const ideaTopics = useMemo(() => {
    const map = new Map<string, string[]>();
    orderedIdeas.forEach((idea) => {
      const topicIds =
        idea.relationships.input_topics?.data.map((topic) => topic.id) || [];
      map.set(idea.id, topicIds);
    });
    return map;
  }, [orderedIdeas]);

  const ideasLength = orderedIdeas.length;

  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const itemHeight = windowHeight - PEEK_HEIGHT;

  const { getVirtualItems, getTotalSize, measureElement } = useVirtualizer({
    count: ideasLength + 1,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 2,
  });

  const virtualItems = getVirtualItems();

  const [centeredIndex, setCenteredIndex] = useState(0);

  const centeredIdeaId = orderedIdeas[centeredIndex]?.id;

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLElement>) => {
      const scrollTop = e.currentTarget.scrollTop;
      const newIndex = Math.round(scrollTop / itemHeight);

      if (
        newIndex >= 0 &&
        newIndex < ideasLength &&
        newIndex !== centeredIndex
      ) {
        setCenteredIndex(newIndex);
      }

      // Fetch next page when reaching the end
      if (virtualItems.length > 0) {
        const lastItem = virtualItems[virtualItems.length - 1];
        if (
          lastItem.index >= ideasLength - 1 &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          fetchNextPage();
        }
      }
    },
    [
      itemHeight,
      ideasLength,
      centeredIndex,
      virtualItems,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
    ]
  );

  if (isLoading || isFetchingInitialIdea) {
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
  const topPadding = PEEK_HEIGHT / 2;

  return (
    <FeedContainer ref={parentRef} onScroll={handleScroll}>
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
                key={`loader-${virtualRow.index}`}
                start={virtualRow.start}
                topOffset={topPadding}
                data-index={virtualRow.index}
                ref={measureElement}
              >
                <NoteContainer
                  peekHeight={PEEK_HEIGHT}
                  noteHeight={noteHeight}
                  isCentered={false}
                  isPrevious={false}
                  isNext={false}
                >
                  <Spinner />
                </NoteContainer>
              </VirtualItem>
            );
          }

          const topicIds = ideaTopics.get(idea.id) || [];
          // Use parentTopicId for color when filtering by subtopic, otherwise use the first topic
          const colorTopicId = parentTopicId || topicId || topicIds[0];
          const topicBackgroundColor = getTopicColor(colorTopicId);

          return (
            <VirtualItem
              key={`${idea.id}-${virtualRow.index}`}
              start={virtualRow.start}
              topOffset={topPadding}
              data-index={virtualRow.index}
              ref={measureElement}
            >
              <NoteContainer
                peekHeight={PEEK_HEIGHT}
                noteHeight={noteHeight}
                bgColor={colors.grey100}
                isCentered={virtualRow.index === centeredIndex}
                isPrevious={virtualRow.index < centeredIndex}
                isNext={virtualRow.index > centeredIndex}
              >
                <StickyNote
                  ideaId={idea.id}
                  topicBackgroundColor={topicBackgroundColor}
                  onClick={() => handleIdeaSelect(idea.id)}
                  centeredIdeaId={centeredIdeaId || undefined}
                  size={noteSize}
                  showReactions={true}
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
