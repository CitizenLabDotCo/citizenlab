import React, { useCallback } from 'react';

import {
  Box,
  Spinner,
  Text,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import usePhase from 'api/phases/usePhase';

import { FormattedMessage } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import IdeaNoteRow from './components/IdeaNoteRow';
import LoaderRow from './components/LoaderRow';
import useIdeasFeedData from './hooks/useIdeasFeedData';
import useTopicEmojis from './hooks/useTopicEmojis';
import useVirtualScroll from './hooks/useVirtualScroll';
import messages from './messages';
import ScrollHintOverlay from './ScrollHintOverlay';
import { NOTE_WIDTH, NOTE_ASPECT_RATIO } from './StickyNotes/StickyNote';

const PEEK_HEIGHT = 200;

const FeedContainer = styled.div`
  scroll-snap-type: y mandatory;
  overflow-y: auto;
  height: 100dvh;
  background: white
    url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='%23e5e5e5'/%3E%3C/svg%3E");

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
  height: calc(100dvh - ${({ peekHeight }) => peekHeight}px);
  padding: 30px;

  > * {
    position: absolute;
    top: 50%;
    transform: ${({
      isCentered,
      isPrevious,
      isNext,
      peekHeight,
      noteHeight,
    }) => {
      const scale = isCentered ? 1.08 : 1;
      const containerHeight = `calc(100dvh - ${peekHeight}px - 60px)`;
      if (isCentered) {
        return `translateY(-50%) scale(${scale})`;
      }
      if (isNext) {
        // Move to top of container
        return `translateY(calc(-50% - (${containerHeight} - ${noteHeight}px) / 2)) scale(${scale})`;
      }
      if (isPrevious) {
        // Move to bottom of container
        return `translateY(calc(-50% + (${containerHeight} - ${noteHeight}px) / 2)) scale(${scale})`;
      }
      return `translateY(-50%) scale(${scale})`;
    }};
    pointer-events: ${({ isCentered }) => (isCentered ? 'auto' : 'none')};
    transition: transform 0.4s ease-out, opacity 0.3s ease-out;
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

  const isMobile = useBreakpoint('phone');

  // Get project ID from phase to fetch topics
  const { data: phase } = usePhase(phaseId);
  const projectId = phase?.data.relationships.project.data.id;

  // Fetch ideas data
  const {
    orderedIdeas,
    ideaTopics,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useIdeasFeedData({ phaseId, topicId, initialIdeaId });

  // Fetch topic emojis
  const topicEmojis = useTopicEmojis(projectId);

  const noteHeight = NOTE_WIDTH / NOTE_ASPECT_RATIO;
  const ideasLength = orderedIdeas.length;

  const handleHeightResize = useCallback(
    (currentCenteredIndex: number) => {
      const currentCenteredIdeaId = orderedIdeas[currentCenteredIndex]?.id;
      if (currentCenteredIdeaId && currentCenteredIdeaId !== initialIdeaId) {
        updateSearchParams({ initial_idea_id: currentCenteredIdeaId });
      }
    },
    [orderedIdeas, initialIdeaId]
  );

  // Virtual scroll setup
  const {
    parentRef,
    virtualItems,
    getTotalSize,
    measureElement,
    centeredIndex,
    handleScroll,
  } = useVirtualScroll({
    itemCount: ideasLength + 1, // +1 for loader row
    peekHeight: PEEK_HEIGHT,
    onHeightResize: handleHeightResize,
  });

  const centeredIdeaId = orderedIdeas[centeredIndex]?.id;

  const handleIdeaSelect = useCallback((ideaId: string) => {
    updateSearchParams({ idea_id: ideaId });
  }, []);

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLElement>) => {
      handleScroll(e, {
        onNearEnd: () => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
      });
    },
    [handleScroll, hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="100vh">
        <Spinner />
      </Box>
    );
  }

  if (orderedIdeas.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="100vh">
        <Text color="coolGrey600">
          <FormattedMessage {...messages.noIdeasForTag} />
        </Text>
      </Box>
    );
  }

  // Add top padding so the first note is centered (half of peek height)
  const topPadding = PEEK_HEIGHT / 2;

  return (
    <FeedContainer ref={parentRef} onScroll={onScroll}>
      {isMobile && <ScrollHintOverlay />}
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
                  <LoaderRow hasNextPage={hasNextPage} />
                </NoteContainer>
              </VirtualItem>
            );
          }

          const topicIds = ideaTopics.get(idea.id) || [];

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
                isCentered={virtualRow.index === centeredIndex}
                isPrevious={virtualRow.index < centeredIndex}
                isNext={virtualRow.index > centeredIndex}
              >
                <IdeaNoteRow
                  ideaId={idea.id}
                  topicIds={topicIds}
                  topicEmojis={topicEmojis}
                  topicId={topicId}
                  parentTopicId={parentTopicId}
                  centeredIdeaId={centeredIdeaId}
                  onSelect={handleIdeaSelect}
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
