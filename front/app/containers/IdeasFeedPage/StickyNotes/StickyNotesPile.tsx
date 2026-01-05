import React from 'react';

import { Box, Button, useBreakpoint } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useInfiniteIdeaFeedIdeas from 'api/idea_feed/useInfiniteIdeaFeedIdeas';
import usePhase from 'api/phases/usePhase';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';
import { getTopicColor } from '../topicsColor';

import StickyNote from './StickyNote';

const PileContainer = styled(Box)`
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

const POSITIONS_DESKTOP = [
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

const POSITIONS_MOBILE = [
  { left: '2%', top: '1%' },
  { left: '42%', top: '4%' },
  { left: '5%', top: '14%' },
  { left: '45%', top: '17%' },
  { left: '2%', top: '30%' },
  { left: '44%', top: '33%' },
  { left: '4%', top: '46%' },
  { left: '42%', top: '49%' },
];

interface Props {
  phaseId: string;
  slug: string;
}

const StickyNotesPile = ({ phaseId, slug }: Props) => {
  const isMobile = useBreakpoint('phone');
  const { data: phase } = usePhase(phaseId);
  const { data } = useInfiniteIdeaFeedIdeas({
    phaseId,
    'page[size]': 20,
  });

  const flatIdeas = data?.pages.flatMap((page) => page.data);
  const ideasCount = phase?.data.attributes.ideas_count ?? 0;

  const handleNoteClick = (ideaId: string) => {
    clHistory.push(
      `/projects/${slug}/ideas-feed?phase_id=${phaseId}&initial_idea_id=${ideaId}`
    );
  };

  const handleSeeAllClick = () => {
    clHistory.push(`/projects/${slug}/ideas-feed?phase_id=${phaseId}`);
  };

  const positions = isMobile ? POSITIONS_MOBILE : POSITIONS_DESKTOP;
  const displayedIdeas = isMobile
    ? flatIdeas?.slice(0, POSITIONS_MOBILE.length)
    : flatIdeas;

  return (
    <Box>
      <PileContainer
        position="relative"
        width="100%"
        height="100%"
        minHeight={isMobile ? '500px' : '750px'}
      >
        {displayedIdeas?.map((idea, index) => {
          const topicIds =
            idea.relationships.topics?.data.map((topic) => topic.id) || [];
          const topicBackgroundColor = getTopicColor(topicIds[0]);

          return (
            <NoteWrapper
              key={idea.id}
              zIndex={String(index)}
              left={positions[index % positions.length].left}
              top={positions[index % positions.length].top}
            >
              <StickyNote
                ideaId={idea.id}
                topicBackgroundColor={topicBackgroundColor}
                onClick={() => handleNoteClick(idea.id)}
              />
            </NoteWrapper>
          );
        })}
      </PileContainer>
      <Box display="flex" justifyContent="center" mt="24px">
        <Button onClick={handleSeeAllClick}>
          <FormattedMessage {...messages.seeAllIdeas} values={{ ideasCount }} />
        </Button>
      </Box>
    </Box>
  );
};

export default StickyNotesPile;
