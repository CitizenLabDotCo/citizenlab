import React, { useMemo } from 'react';

import {
  Box,
  Button,
  Spinner,
  Text,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useInfiniteIdeaFeedIdeas from 'api/idea_feed/useInfiniteIdeaFeedIdeas';
import useInputTopics from 'api/input_topics/useInputTopics';
import usePhase from 'api/phases/usePhase';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { getInputTermMessage } from 'utils/i18n';

import messages from '../messages';
import { getTopicColor } from '../topicsColor';

import StickyNote, { TopicInfo } from './StickyNote';

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

// Desktop positions use pixel values for consistent centering
const POSITIONS_DESKTOP = [
  { left: '0px', top: '2%' },
  { left: '180px', top: '8%' },
  { left: '384px', top: '3%' },
  { left: '576px', top: '10%' },
  { left: '756px', top: '5%' },
  { left: '60px', top: '18%' },
  { left: '240px', top: '22%' },
  { left: '456px', top: '19%' },
  { left: '636px', top: '24%' },
  { left: '816px', top: '20%' },
  { left: '24px', top: '32%' },
  { left: '204px', top: '36%' },
  { left: '420px', top: '33%' },
  { left: '600px', top: '38%' },
  { left: '780px', top: '35%' },
];

// Tablet positions use pixel values for consistent centering
const POSITIONS_TABLET = [
  { left: '30px', top: '2%' },
  { left: '250px', top: '8%' },
  { left: '450px', top: '1%' },
  { left: '80px', top: '19%' },
  { left: '280px', top: '24%' },
  { left: '490px', top: '16%' },
  { left: '20px', top: '38%' },
  { left: '210px', top: '42%' },
  { left: '430px', top: '35%' },
  { left: '50px', top: '55%' },
  { left: '300px', top: '58%' },
  { left: '470px', top: '52%' },
];

// Mobile positions use pixel values for consistent centering
const POSITIONS_MOBILE = [
  { left: '10px', top: '1%' },
  { left: '25px', top: '14%' },
  { left: '5px', top: '30%' },
  { left: '30px', top: '43%' },
  { left: '15px', top: '58%' },
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
  const localize = useLocalize();
  const { data: phase } = usePhase(phaseId);
  const { data, isLoading } = useInfiniteIdeaFeedIdeas({
    phaseId,
    'page[size]': 15,
  });

  const projectId = phase?.data.relationships.project.data.id;
  const { data: topicsData } = useInputTopics(projectId);

  // Create topic data lookup map with emoji and name
  const topicDataMap = useMemo(() => {
    const map = new Map<string, { emoji: string | null; name: string }>();
    topicsData?.data.forEach((topic) => {
      const emoji = topic.attributes.icon || topic.attributes.parent_icon;
      const name = localize(topic.attributes.title_multiloc);
      map.set(topic.id, { emoji, name });
    });
    return map;
  }, [topicsData, localize]);

  const flatIdeas = data?.pages.flatMap((page) => page.data);
  const ideasCount = phase?.data.attributes.ideas_count ?? 0;
  const inputTerm = phase?.data.attributes.input_term ?? 'idea';

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

  if (isLoading) {
    return <Spinner />;
  }

  if (!displayedIdeas || displayedIdeas.length === 0) {
    return (
      <Box display="flex" justifyContent="center" py="64px">
        <Text color="textSecondary">
          <FormattedMessage {...messages.nothingToShowYet} />
        </Text>
      </Box>
    );
  }

  // Use fixed width containers that center the pile
  const mobileContainerWidth = 340;
  const tabletContainerWidth = 800;
  const desktopContainerWidth = 1200;

  return (
    <Box overflow="hidden">
      <Box display="flex" justifyContent="center" width="100%">
        <PileContainer
          position="relative"
          width="100%"
          maxWidth={
            isMobile
              ? `${mobileContainerWidth}px`
              : isTablet
              ? `${tabletContainerWidth}px`
              : `${desktopContainerWidth}px`
          }
          height="100%"
          minHeight={isMobile || isTablet ? '800px' : '650px'}
        >
          {displayedIdeas.map((idea, index) => {
            const topicIds =
              idea.relationships.input_topics?.data.map((topic) => topic.id) ||
              [];
            const topicBackgroundColor = getTopicColor(topicIds[0]);
            // Get topic info (emoji + name) from all topics associated with this idea
            const topics: TopicInfo[] = topicIds
              .map((id) => topicDataMap.get(id))
              .filter(
                (data): data is { emoji: string | null; name: string } =>
                  data != null && data.emoji != null
              )
              .map((data) => ({
                emoji: data.emoji as string,
                name: data.name,
              }));

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
                  topics={topics}
                  onClick={() => handleNoteClick(idea.id)}
                  rotation={ROTATIONS[index % ROTATIONS.length]}
                  showReactions={false}
                />
              </NoteWrapper>
            );
          })}
        </PileContainer>
      </Box>
      <Box display="flex" justifyContent="center" mt="24px">
        <Button onClick={handleSeeAllClick}>
          <FormattedMessage
            {...getInputTermMessage(inputTerm, {
              idea: messages.seeAllIdeas,
              option: messages.seeAllOptions,
              project: messages.seeAllProjects,
              question: messages.seeAllQuestions,
              issue: messages.seeAllIssues,
              contribution: messages.seeAllContributions,
              proposal: messages.seeAllProposals,
              initiative: messages.seeAllInitiatives,
              petition: messages.seeAllPetitions,
              comment: messages.seeAllComments,
              statement: messages.seeAllStatements,
            })}
            values={{ ideasCount }}
          />
        </Button>
      </Box>
    </Box>
  );
};

export default StickyNotesPile;
