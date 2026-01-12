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
  { left: '20%', top: '8%' },
  { left: '37%', top: '3%' },
  { left: '53%', top: '10%' },
  { left: '68%', top: '5%' },
  { left: '10%', top: '18%' },
  { left: '25%', top: '22%' },
  { left: '43%', top: '19%' },
  { left: '58%', top: '24%' },
  { left: '73%', top: '20%' },
  { left: '7%', top: '32%' },
  { left: '22%', top: '36%' },
  { left: '40%', top: '33%' },
  { left: '55%', top: '38%' },
  { left: '70%', top: '35%' },
  { left: '13%', top: '46%' },
  { left: '28%', top: '50%' },
  { left: '45%', top: '47%' },
  { left: '60%', top: '52%' },
  { left: '75%', top: '49%' },
];

const POSITIONS_TABLET = [
  { left: '5%', top: '2%' },
  { left: '38%', top: '8%' },
  { left: '65%', top: '1%' },
  { left: '12%', top: '19%' },
  { left: '42%', top: '24%' },
  { left: '70%', top: '16%' },
  { left: '3%', top: '38%' },
  { left: '32%', top: '42%' },
  { left: '62%', top: '35%' },
  { left: '8%', top: '55%' },
  { left: '45%', top: '58%' },
  { left: '68%', top: '52%' },
];

const POSITIONS_MOBILE = [
  { left: '5%', top: '1%' },
  { left: '48%', top: '6%' },
  { left: '2%', top: '16%' },
  { left: '52%', top: '20%' },
  { left: '8%', top: '33%' },
  { left: '46%', top: '38%' },
  { left: '3%', top: '50%' },
  { left: '50%', top: '54%' },
];

// Slight rotations to give a natural scattered look
const ROTATIONS = [
  -3, 2, -1, 4, -2, 3, -4, 1, 2, -3, 1, -2, 3, -1, 4, -3, 2, -4, 1, -2, 3, -1,
  2, -3, 4,
];

interface Props {
  phaseId: string;
  slug: string;
}

const StickyNotesPile = ({ phaseId, slug }: Props) => {
  const isMobile = useBreakpoint('phone');
  const isTablet = useBreakpoint('tablet');
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

  const getPositionsConfig = () => {
    if (isMobile) {
      return { positions: POSITIONS_MOBILE, count: POSITIONS_MOBILE.length };
    }
    if (isTablet) {
      return { positions: POSITIONS_TABLET, count: POSITIONS_TABLET.length };
    }
    return { positions: POSITIONS_DESKTOP, count: POSITIONS_DESKTOP.length };
  };

  const { positions, count } = getPositionsConfig();
  const displayedIdeas = flatIdeas?.slice(0, count);

  return (
    <Box>
      <PileContainer
        position="relative"
        width="100%"
        height="100%"
        minHeight="800px"
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
                size="small"
                rotation={ROTATIONS[index % ROTATIONS.length]}
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
