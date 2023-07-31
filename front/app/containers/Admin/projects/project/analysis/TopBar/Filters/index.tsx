import React from 'react';
import {
  Box,
  colors,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import messages from '../../messages';
import EngagementFilter from './EngagementFilter';
import TimeFilter from './TimeFilter';
import AuthorFilters from './AuthorFilters';

const Filters = () => {
  const { formatMessage } = useIntl();

  return (
    <Box
      position="absolute"
      top={`${stylingConsts.menuHeight}px`}
      left="0"
      bg={colors.white}
      w="100%"
      p="24px"
    >
      <Box display="flex" gap="32px">
        <Box w="33%">
          <Text color="primary" fontWeight="bold">
            {formatMessage(messages.author)}
          </Text>
          <AuthorFilters />
        </Box>
        <Box w="33%">
          <Text color="primary" fontWeight="bold" mb="44px">
            {formatMessage(messages.input)}
          </Text>
          <TimeFilter />
        </Box>
        <Box w="33%">
          <Text color="primary" fontWeight="bold">
            {formatMessage(messages.engagement)}
          </Text>
          <EngagementFilter
            id="votes"
            label={formatMessage(messages.numberOfVotes)}
            searchParams={{
              from: 'votes_from',
              to: 'votes_to',
            }}
          />
          <EngagementFilter
            id="comments"
            label={formatMessage(messages.numberOfComments)}
            searchParams={{
              from: 'comments_from',
              to: 'comments_to',
            }}
          />
          <EngagementFilter
            id="reactions"
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
