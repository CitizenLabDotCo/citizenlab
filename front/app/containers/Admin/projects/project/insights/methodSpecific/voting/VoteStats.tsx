import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { VotingIdeaResult } from 'api/voting_insights/types';

import { CHART_COLORS } from './constants';

interface Props {
  idea: VotingIdeaResult;
}

const VoteStats = ({ idea }: Props) => {
  const totalVotes = idea.total_votes;
  const offlinePercentage =
    totalVotes > 0 ? Math.round((idea.offline_votes / totalVotes) * 100) : 0;

  return (
    <Box display="flex" alignItems="center" gap="8px" flexShrink={0}>
      <Text
        m="0"
        fontSize="s"
        fontWeight="bold"
        style={{ color: CHART_COLORS.darkBlue }}
      >
        {idea.percentage}%
      </Text>
      {idea.offline_votes > 0 && (
        <Text m="0" fontSize="s" color="textSecondary">
          ⫶ {offlinePercentage}%
        </Text>
      )}
      <Text m="0" fontSize="s" color="textSecondary">
        ({totalVotes})
      </Text>
    </Box>
  );
};

export default VoteStats;
