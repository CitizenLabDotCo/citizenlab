import React from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';
import Text from 'component-library/components/Text';

import useCommonGroundResults from 'api/common_ground/useCommonGroundResults';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import ResultList from './ResultList';
import Statistics from './Statistics';

interface Props {
  phaseId: string;
}

const CommonGroundResults = ({ phaseId }: Props) => {
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
        title={formatMessage(messages.majority)}
        description={formatMessage(messages.majorityDescription)}
        items={top_consensus_ideas}
      />
      <ResultList
        title={formatMessage(messages.divisive)}
        description={formatMessage(messages.divisiveDescription)}
        items={top_controversial_ideas}
      />
    </Box>
  );
};

export default CommonGroundResults;
