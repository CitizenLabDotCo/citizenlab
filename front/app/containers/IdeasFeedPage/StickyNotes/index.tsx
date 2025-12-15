import React, { useMemo, useState, useRef, useEffect } from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import useIdeaFeedIdeas from 'api/idea_feed/useInfiniteIdeaFeedIdeas';

import CloseIconButton from 'components/UI/CloseIconButton';

import { getTopicColor } from '../topicsColor';

import StickyNote from './StickyNote';

const PileContainer = styled(Box)<{ $isFeedView: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 800px;
  padding: ${(props) => (props.$isFeedView ? '20px 60px' : '40px 20px')};
  overflow: ${(props) => (props.$isFeedView ? 'auto' : 'hidden')};
  transition: padding 0.4s ease;
`;

const NoteWrapper = styled(Box)<{
  index: number;
  totalNotes: number;
  $isFeedView: boolean;
  $clickedIndex: number | null;
}>`
  position: ${(props) => (props.$isFeedView ? 'relative' : 'absolute')};
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(props) => {
    if (!props.$isFeedView) return 1;
    return 1;
  }};
  ${(props) => {
    if (props.$isFeedView) {
      return `
        left: auto;
        top: auto;
        margin: 20px auto;
        display: flex;
        transform: rotate(0deg) !important;
      `;
    }
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
    // Staggered animation delay for a cascading effect
    const delay = props.index * 0.03;
    return `
      left: ${position.left};
      top: ${position.top};
      animation: noteScatter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both;
      @keyframes noteScatter {
        0% {
          opacity: 0;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) scale(0.5);
        }
        100% {
          opacity: 1;
          transform: translate(0, 0) scale(1);
        }
      }
    `;
  }}
  &:hover,
  &:focus-within {
    z-index: ${(props) => (props.$isFeedView ? 'auto' : '100 !important')};
    transform: ${(props) =>
      props.$isFeedView
        ? 'none'
        : 'scale(1.05) translateY(-8px) rotate(0deg) !important'};
  }
`;

interface Props {
  phaseId: string;
  maxNotes?: number;
}

const StickyNotesPile: React.FC<Props> = ({ maxNotes = 10, phaseId }) => {
  const [isFeedView, setIsFeedView] = useState(false);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const noteRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [searchParams] = useSearchParams();
  const topicId = searchParams.get('topic');
  const { data: ideas, isLoading: ideasLoading } = useIdeaFeedIdeas({
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

  // Handle note click to switch to feed view
  const handleNoteClick = (index: number) => {
    setClickedIndex(index);
    setIsFeedView(true);
  };

  // Handle closing feed view
  const handleCloseFeed = () => {
    setIsFeedView(false);
    setClickedIndex(null);
  };

  // Scroll to the clicked note when entering feed view
  useEffect(() => {
    if (isFeedView && clickedIndex !== null && noteRefs.current[clickedIndex]) {
      // Wait for the transition to start, then scroll
      setTimeout(() => {
        noteRefs.current[clickedIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }, [isFeedView, clickedIndex]);

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

  const rotations = [
    -8, 5, -3, 7, -5, 2, -6, 4, -2, 6, -4, 3, -7, 8, -1, 5, -9, 4, -3, 7, -5, 2,
    -4, 6, -2,
  ];
  const totalNotes = Math.min(flatIdeas.length, maxNotes);

  return (
    <>
      {isFeedView && <CloseIconButton onClick={handleCloseFeed} />}
      <PileContainer ref={containerRef} $isFeedView={isFeedView}>
        {flatIdeas.slice(0, maxNotes).map((idea, index) => {
          const topicIds = ideaTopics.get(idea.id) || [];
          const topicBackgroundColor = getTopicColor(topicIds[0]);

          return (
            <NoteWrapper
              key={idea.id}
              ref={(el) => (noteRefs.current[index] = el)}
              index={index}
              totalNotes={totalNotes}
              $isFeedView={isFeedView}
              $clickedIndex={clickedIndex}
              style={{ zIndex: isFeedView ? 'auto' : index }}
            >
              <StickyNote
                ideaId={idea.id}
                rotation={isFeedView ? 0 : rotations[index % rotations.length]}
                topicBackgroundColor={topicBackgroundColor}
                onClick={() => handleNoteClick(index)}
              />
            </NoteWrapper>
          );
        })}
      </PileContainer>
    </>
  );
};

export default StickyNotesPile;
