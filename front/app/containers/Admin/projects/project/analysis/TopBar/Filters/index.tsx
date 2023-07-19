import React from 'react';
import { Box, colors, Text } from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import EngagementFilter from './EngagementFilter';

const Filters = () => {
  const { formatMessage } = useIntl();
  return (
    <Box
      position="absolute"
      bottom="-320px"
      left="0"
      bg={colors.white}
      w="100%"
      h="320px"
    >
      <Box display="flex" gap="24px" px="24px">
        <Text fontWeight="bold">{formatMessage(messages.author)}</Text>
        <Text fontWeight="bold">{formatMessage(messages.input)}</Text>
        <Box>
          <Text fontWeight="bold">{formatMessage(messages.engagement)}</Text>
          <EngagementFilter
            label={formatMessage(messages.numberOfVotes)}
            searchParams={{
              from: 'votes_from',
              to: 'votes_to',
            }}
          />
          <EngagementFilter
            label={formatMessage(messages.numberOfComments)}
            searchParams={{
              from: 'comments_from',
              to: 'comments_to',
            }}
          />
          <EngagementFilter
            label={formatMessage(messages.numberOfReactions)}
            searchParams={{
              from: 'reactions_from',
              to: 'reactions_to',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Filters;
