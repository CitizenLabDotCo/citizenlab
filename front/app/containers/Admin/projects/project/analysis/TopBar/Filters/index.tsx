import React from 'react';
import {
  Box,
  colors,
  stylingConsts,
  Text,
  defaultStyles,
} from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import translations from '../translations';
import EngagementFilter from './EngagementFilter';
import TimeFilter from './TimeFilter';
import AuthorFilters from './AuthorFilters';
import { useParams } from 'react-router-dom';
import useAnalysis from 'api/analyses/useAnalysis';
import CloseIconButton from 'components/UI/CloseIconButton';

interface FilterProps {
  onClose: () => void;
}

const Filters = ({ onClose }: FilterProps) => {
  const { analysisId } = useParams() as { analysisId: string };
  const { data: analysis } = useAnalysis(analysisId);
  const { formatMessage } = useIntl();

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
            {formatMessage(translations.author)}
          </Text>
          <AuthorFilters />
        </Box>
        <Box w="33%">
          <Text color="primary" fontWeight="bold" mb="44px">
            {formatMessage(translations.input)}
          </Text>
          <TimeFilter />
        </Box>
        {analysis?.data.attributes.participation_method === 'ideation' && (
          <Box w="33%">
            <Text color="primary" fontWeight="bold">
              {formatMessage(translations.engagement)}
            </Text>
            <EngagementFilter
              id="votes"
              label={formatMessage(translations.numberOfVotes)}
              searchParams={{
                from: 'votes_from',
                to: 'votes_to',
              }}
            />
            <EngagementFilter
              id="comments"
              label={formatMessage(translations.numberOfComments)}
              searchParams={{
                from: 'comments_from',
                to: 'comments_to',
              }}
            />
            <EngagementFilter
              id="reactions"
              label={formatMessage(translations.numberOfReactions)}
              searchParams={{
                from: 'reactions_from',
                to: 'reactions_to',
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Filters;
