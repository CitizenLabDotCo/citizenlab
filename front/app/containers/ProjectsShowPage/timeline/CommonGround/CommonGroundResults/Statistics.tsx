import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
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
  const isPhoneOrSmaller = useBreakpoint('phone');

  const numberFontSize = isPhoneOrSmaller ? 'xxl' : 'xxxxl';
  const labelFontSize = isPhoneOrSmaller ? 's' : 'm';

  return (
    <Box
      display="flex"
      flexWrap="wrap"
      gap={isPhoneOrSmaller ? '24px' : '48px'}
      mb="32px"
    >
      <Box>
        <Text fontSize={numberFontSize} fontWeight="bold" as="span" my="0px">
          {numOfParticipants}
        </Text>
        <Text fontSize={labelFontSize} color="textPrimary" as="p" my="0px">
          {formatMessage(
            numOfParticipants !== 1
              ? messages.participants
              : messages.participant
          )}
        </Text>
      </Box>
      <Box>
        <Text fontSize={numberFontSize} fontWeight="bold" as="span" my="0px">
          {numOfIdeas}
        </Text>
        <Text fontSize={labelFontSize} color="textPrimary" as="p" my="0px">
          {formatMessage(
            numOfIdeas !== 1 ? messages.statements : messages.statement
          )}
        </Text>
      </Box>
      <Box>
        <Text fontSize={numberFontSize} fontWeight="bold" as="span" my="0px">
          {totalVotes}
        </Text>
        <Text fontSize={labelFontSize} color="textPrimary" as="p" my="0px">
          {formatMessage(totalVotes !== 1 ? messages.votes : messages.vote)}
        </Text>
      </Box>
    </Box>
  );
};

export default Statistics;
