import React from 'react';

import {
  Box,
  colors,
  stylingConsts,
  Text,
  defaultStyles,
} from '@citizenlab/cl2-component-library';

import useAnalysis from 'api/analyses/useAnalysis';

import CloseIconButton from 'components/UI/CloseIconButton';

import { useIntl } from 'utils/cl-intl';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import { useParams } from 'utils/router';

import messages from '../messages';

import AuthorFilters from './AuthorFilters';
import EmptyCustomFieldsFilter from './EmptyCustomFieldsFilter';
import EngagementFilter from './EngagementFilter';
import TimeFilter from './TimeFilter';

interface FilterProps {
  onClose: () => void;
}

const Filters = ({ onClose }: FilterProps) => {
  const { analysisId } = useParams({
    from: '/$locale/admin/projects/$projectId/analysis/$analysisId',
  });
  const { data: analysis } = useAnalysis(analysisId);
  const { formatMessage } = useIntl();

  const method =
    analysis && getMethodConfig(analysis.data.attributes.participation_method);

  const showEngagementFilters =
    method?.supportsReactions ||
    method?.supportsVotes ||
    method?.supportsComments;

  return (
    <Box
      position="absolute"
      top={`${stylingConsts.menuHeight}px`}
      left="0"
      bg={colors.white}
      w="100%"
      px="24px"
      pb="24px"
      boxShadow={defaultStyles.boxShadow}
    >
      <Box position="absolute" right="16px" top="16px">
        <CloseIconButton onClick={onClose} />
      </Box>
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
          {analysis?.data.attributes.participation_method ===
            'native_survey' && (
            <>
              <Text color="primary" fontWeight="bold" mb="44px">
                {formatMessage(messages.emptyCustomFields)}
              </Text>
              <EmptyCustomFieldsFilter />
            </>
          )}
          {showEngagementFilters && (
            <>
              <Text color="primary" fontWeight="bold">
                {formatMessage(messages.engagement)}
              </Text>
              {method.supportsVotes && (
                <EngagementFilter
                  id="votes"
                  label={formatMessage(messages.numberOfVotes)}
                  searchParams={{
                    from: 'votes_from',
                    to: 'votes_to',
                  }}
                />
              )}
              {method.supportsComments && (
                <EngagementFilter
                  id="comments"
                  label={formatMessage(messages.numberOfComments)}
                  searchParams={{
                    from: 'comments_from',
                    to: 'comments_to',
                  }}
                />
              )}
              {method.supportsReactions && (
                <EngagementFilter
                  id="reactions"
                  label={formatMessage(messages.numberOfReactions)}
                  searchParams={{
                    from: 'reactions_from',
                    to: 'reactions_to',
                  }}
                />
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Filters;
