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
  min-height: 800px;
  padding: 40px 20px;
`;

const NoteWrapper = styled(Box)<{ index: number; totalNotes: number }>`
  position: absolute;
  transition: transform 0.3s ease, z-index 0s;

  ${(props) => {
    const positions = [
      { left: '1%', top: '20px' },
      { left: '21%', top: '80px' },
      { left: '42%', top: '40px' },
      { left: '63%', top: '100px' },
      { left: '83%', top: '60px' },
      { left: '6%', top: '180px' },
      { left: '27%', top: '220px' },
      { left: '48%', top: '190px' },
      { left: '69%', top: '240px' },
      { left: '88%', top: '210px' },
      { left: '3%', top: '340px' },
      { left: '24%', top: '380px' },
      { left: '45%', top: '350px' },
      { left: '66%', top: '400px' },
      { left: '85%', top: '370px' },
      { left: '10%', top: '500px' },
      { left: '31%', top: '540px' },
      { left: '52%', top: '510px' },
      { left: '73%', top: '560px' },
      { left: '90%', top: '530px' },
      { left: '15%', top: '660px' },
      { left: '36%', top: '700px' },
      { left: '57%', top: '670px' },
      { left: '78%', top: '720px' },
      { left: '8%', top: '460px' },
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
        const topicColors =
          topicIds.length > 0 ? topicColorMap.get(topicIds[0]) : undefined;

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
              topicColors={topicColors}
            />
          </NoteWrapper>
        );
      })}
    </PileContainer>
  );
};

export default StickyNotesPile;
