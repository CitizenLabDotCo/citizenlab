import React from 'react';

import { Box, Spinner, Text } from 'component-library';

import useCommonGroundResults from 'api/common_ground/useCommonGroundResults';

import ResultList from 'containers/ProjectsShowPage/timeline/CommonGround/CommonGroundResults/ResultList';
import Statistics from 'containers/ProjectsShowPage/timeline/CommonGround/CommonGroundResults/Statistics';
import messages from 'containers/ProjectsShowPage/timeline/CommonGround/messages';

import { useIntl } from 'utils/cl-intl';

import { MethodSpecificInsightProps } from './types';

const CommonGroundInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  const { formatMessage } = useIntl();
  const { data: results, isLoading } = useCommonGroundResults(phaseId);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p="20px">
        <Spinner />
      </Box>
    );
  }

  if (!results) {
    return (
      <Box display="flex" justifyContent="center" p="20px">
        <Text color="textSecondary">{formatMessage(messages.noResults)}</Text>
      </Box>
    );
  }

  const {
    stats: { num_participants, num_ideas, votes },
    top_consensus_ideas,
    top_controversial_ideas,
  } = results.data.attributes;

  const totalVotes = votes.up + votes.down + votes.neutral;

  return (
    <Box mt="8px" bg="white" p="30px 30px 48px 30px">
      <Statistics
        numOfParticipants={num_participants}
        numOfIdeas={num_ideas}
        totalVotes={totalVotes}
      />
      <ResultList
        title={formatMessage(messages.highestConsensusTitle)}
        description={formatMessage(messages.highestConsensusDescription)}
        items={top_consensus_ideas}
      />
      <ResultList
        title={formatMessage(messages.closeCallsTitle)}
        description={formatMessage(messages.closeCallsDescription)}
        items={top_controversial_ideas}
      />
    </Box>
  );
};

export default CommonGroundInsights;
