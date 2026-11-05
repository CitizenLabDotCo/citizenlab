import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { VotingIdeaResult } from 'api/phase_insights/voting_insights/types';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  idea: VotingIdeaResult;
}

const VoteStats = ({ idea }: Props) => {
  const { formatMessage } = useIntl();
  const totalVotes = idea.total_votes;
  const offlineVotes = idea.offline_votes;

  const votesText =
    offlineVotes > 0
      ? formatMessage(messages.xVotesInclOffline, {
          count: totalVotes,
          offlineCount: offlineVotes,
        })
      : formatMessage(messages.xVotes, { count: totalVotes });

  return (
    <Box display="flex" alignItems="center" gap="4px" flexShrink={0}>
      <Text m="0" fontSize="s" fontWeight="bold" color="blue500">
        {idea.percentage}%
      </Text>
      <Text m="0" fontSize="s" color="textSecondary">
        •
      </Text>
      <Text m="0" fontSize="s" color="textSecondary">
        {votesText}
      </Text>
    </Box>
  );
};

export default VoteStats;
