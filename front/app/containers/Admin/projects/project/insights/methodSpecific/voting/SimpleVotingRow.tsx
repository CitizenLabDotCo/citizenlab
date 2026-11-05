import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { VotingIdeaResult } from 'api/phase_insights/voting_insights/types';

import ProgressBarWrapper from 'containers/ProjectsShowPage/timeline/VotingResults/ProgressBar/ProgressBarWrapper';

import { INSIGHTS_CHART_COLORS } from '../../constants';

import IdeaThumbnail from './IdeaThumbnail';
import { getScaledPercentages } from './utils';
import VoteStats from './VoteStats';

interface Props {
  idea: VotingIdeaResult;
  title: string;
  tooltip: string;
}

const SimpleVotingRow = ({ idea, title, tooltip }: Props) => {
  const { onlinePct, offlinePct } = getScaledPercentages(
    idea.online_votes,
    idea.offline_votes,
    idea.percentage
  );

  return (
    <Box display="flex" alignItems="center" gap="16px" py="12px">
      <Box flexShrink={0}>
        <IdeaThumbnail imageUrl={idea.image_url} alt={title} />
      </Box>

      <Box flex="1" minWidth="0">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb="8px"
        >
          <Text
            m="0"
            fontSize="s"
            color="textPrimary"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {title}
          </Text>
          <VoteStats idea={idea} />
        </Box>
        <ProgressBarWrapper
          votesPercentage={onlinePct}
          manualVotesPercentage={offlinePct}
          tooltip={tooltip}
          barColor={INSIGHTS_CHART_COLORS.darkBlue}
          bgColor={colors.grey300}
          height="16px"
        />
      </Box>
    </Box>
  );
};

export default SimpleVotingRow;
