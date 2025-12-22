import React, { useMemo } from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import useIdeaFeedIdeas from 'api/idea_feed/useInfiniteIdeaFeedIdeas';

import { getTopicColor } from '../topicsColor';

import StickyNote from './StickyNote';

const PileContainer = styled(Box)`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 800px;
  transition: padding 0.4s ease;
`;

const NoteWrapper = styled(Box)`
  position: absolute;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover,
  &:focus-within {
    z-index: 100 !important;
    transform: scale(1.05) translateY(-8px) rotate(0deg) !important;
  }
`;

const POSITIONS = [
  { left: '5%', top: '2%' },
  { left: '20%', top: '10%' },
  { left: '37%', top: '5%' },
  { left: '53%', top: '12%' },
  { left: '68%', top: '8%' },
  { left: '10%', top: '20%' },
  { left: '25%', top: '26%' },
  { left: '43%', top: '23%' },
  { left: '58%', top: '28%' },
  { left: '73%', top: '25%' },
  { left: '7%', top: '36%' },
  { left: '22%', top: '41%' },
  { left: '40%', top: '38%' },
  { left: '55%', top: '43%' },
  { left: '70%', top: '40%' },
  { left: '13%', top: '50%' },
  { left: '28%', top: '55%' },
  { left: '45%', top: '52%' },
  { left: '60%', top: '57%' },
  { left: '75%', top: '54%' },
  { left: '15%', top: '64%' },
  { left: '33%', top: '68%' },
  { left: '50%', top: '66%' },
  { left: '65%', top: '70%' },
  { left: '9%', top: '47%' },
];

interface Props {
  phaseId: string;
  maxNotes?: number;
}

const StickyNotesPile = ({ maxNotes = 20, phaseId }: Props) => {
  const [searchParams] = useSearchParams();
  const topicId = searchParams.get('topic');
  const {
    data: ideas,
    isLoading: ideasLoading,
    isFetching,
  } = useIdeaFeedIdeas({
    phaseId,
    topic: topicId || undefined,
    'page[size]': maxNotes,
  });

  const flatIdeas = useMemo(() => {
    if (!ideas) return [];
    return ideas.data;
  }, [ideas]);

  // Extract topic IDs for each idea
  const ideaTopics = useMemo(() => {
    const map = new Map<string, string[]>();
    flatIdeas.forEach((idea) => {
      const topicIds =
        idea.relationships.topics?.data.map((topic) => topic.id) || [];
      map.set(idea.id, topicIds);
    });
    return map;
  }, [flatIdeas]);

  if (ideasLoading) {
    return (
      <Box display="flex" justifyContent="center" p="40px">
        <Spinner />
      </Box>
    );
  }

  if (!ideas || flatIdeas.length === 0) {
    return null;
  }

  return (
    <PileContainer>
      {flatIdeas.slice(0, maxNotes).map((idea, index) => {
        const topicIds = ideaTopics.get(idea.id) || [];
        const topicBackgroundColor =
          topicId && !isFetching
            ? getTopicColor(topicId)
            : getTopicColor(topicIds[0]);

        return (
          <NoteWrapper
            key={idea.id}
            zIndex={String(index)}
            left={POSITIONS[index % POSITIONS.length].left}
            top={POSITIONS[index % POSITIONS.length].top}
          >
            <StickyNote
              ideaId={idea.id}
              topicBackgroundColor={topicBackgroundColor}
              onClick={() => {
                // TODO: open feed
              }}
            />
          </NoteWrapper>
        );
      })}
    </PileContainer>
  );
};

export default StickyNotesPile;
