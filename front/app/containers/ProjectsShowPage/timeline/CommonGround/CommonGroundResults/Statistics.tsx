import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import Text from 'component-library/components/Text';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  numOfParticipants: number;
  numOfIdeas: number;
  totalVotes: number;
}

const Statistics = ({ numOfParticipants, numOfIdeas, totalVotes }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" mb="32px">
      <Box mr="48px">
        <Text fontSize="xxxxl" fontWeight="bold" as="span" my="0px">
          {numOfParticipants}
        </Text>
        <Text fontSize="m" color="textPrimary" as="p" my="0px">
          {formatMessage(
            numOfParticipants !== 1
              ? messages.participants
              : messages.participant
          )}
        </Text>
      </Box>
      <Box mr="48px">
        <Text fontSize="xxxxl" fontWeight="bold" as="span" my="0px">
          {numOfIdeas}
        </Text>
        <Text fontSize="m" color="textPrimary" as="p" my="0px">
          {formatMessage(
            numOfIdeas !== 1 ? messages.statements : messages.statement
          )}
        </Text>
      </Box>
      <Box>
        <Text fontSize="xxxxl" fontWeight="bold" as="span" my="0px">
          {totalVotes}
        </Text>
        <Text fontSize="m" color="textPrimary" as="p" my="0px">
          {formatMessage(totalVotes !== 1 ? messages.votes : messages.vote)}
        </Text>
      </Box>
    </Box>
  );
};

export default Statistics;
