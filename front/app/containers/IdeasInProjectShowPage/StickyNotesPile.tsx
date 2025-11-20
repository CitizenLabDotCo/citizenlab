import React, { useMemo } from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IIdeaQueryParameters } from 'api/ideas/types';
import useIdeas from 'api/ideas/useIdeas';
import useTopics from 'api/topics/useTopics';

import StickyNote from './StickyNote';
import { createTopicColorMap } from './topicColors';

const PileContainer = styled(Box)`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 800px;
  padding: 40px 20px;
  overflow: hidden;
`;

const NoteWrapper = styled(Box)<{ index: number; totalNotes: number }>`
  position: absolute;
  transition: transform 0.3s ease, z-index 0s;

  ${(props) => {
    const positions = [
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

    const position = positions[props.index % positions.length];
    return `
      left: ${position.left};
      top: ${position.top};
    `;
  }}

  &:hover {
    z-index: 100 !important;
    transform: scale(1.05) translateY(-8px) rotate(0deg) !important;
  }
`;

interface Props {
  queryParameters: IIdeaQueryParameters;
  maxNotes?: number;
}

const StickyNotesPile: React.FC<Props> = ({
  queryParameters,
  maxNotes = 10,
}) => {
  const { data: ideas, isLoading: ideasLoading } = useIdeas({
    ...queryParameters,
    'page[size]': maxNotes,
  });

  const { data: topics, isLoading: topicsLoading } = useTopics();

  // Create a color map for all topics
  const topicColorMap = useMemo(() => {
    if (!topics) return new Map();
    const topicIds = topics.data.map((topic) => topic.id);
    return createTopicColorMap(topicIds);
  }, [topics]);

  // Extract topic IDs for each idea
  const ideaTopics = useMemo(() => {
    if (!ideas) return new Map<string, string[]>();
    const map = new Map<string, string[]>();
    ideas.data.forEach((idea) => {
      const topicIds =
        idea.relationships.topics?.data.map((topic) => topic.id) || [];
      map.set(idea.id, topicIds);
    });
    return map;
  }, [ideas]);

  if (ideasLoading || topicsLoading) {
    return (
      <Box display="flex" justifyContent="center" p="40px">
        <Spinner />
      </Box>
    );
  }

  if (!ideas || ideas.data.length === 0) {
    return null;
  }

  const rotations = [
    -8, 5, -3, 7, -5, 2, -6, 4, -2, 6, -4, 3, -7, 8, -1, 5, -9, 4, -3, 7, -5, 2,
    -4, 6, -2,
  ];
  const totalNotes = Math.min(ideas.data.length, maxNotes);

  return (
    <PileContainer>
      {ideas.data.slice(0, maxNotes).map((idea, index) => {
        const topicIds = ideaTopics.get(idea.id) || [];
        const topicBackgroundColor =
          topicIds.length > 0 ? topicColorMap.get(topicIds[0]) : '';

        return (
          <NoteWrapper
            key={idea.id}
            index={index}
            totalNotes={totalNotes}
            style={{ zIndex: index }}
          >
            <StickyNote
              ideaId={idea.id}
              rotation={rotations[index % rotations.length]}
              topicBackgroundColor={topicBackgroundColor}
            />
          </NoteWrapper>
        );
      })}
    </PileContainer>
  );
};

export default StickyNotesPile;
