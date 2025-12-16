import React, { useState } from 'react';

import {
  Box,
  Text,
  Title,
  Select,
  colors,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';
import { IOption } from 'typings';

import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';
import { DemographicFieldKey } from 'api/voting_insights/types';
import useVotingPhaseVotes from 'api/voting_insights/useVotingPhaseVotes';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import { INSIGHTS_CHART_COLORS } from '../../constants';

import ClusteredIdeaRow from './ClusteredIdeaRow';
import { getStripedPattern } from './constants';
import messages from './messages';
import { getDemographicKeys } from './utils';
import VotingIdeaRow from './VotingIdeaRow';

interface Props {
  phaseId: string;
}

const VoteResults = ({ phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const theme = useTheme();
  const [clusterBy, setClusterBy] = useState<string>('');

  const { data: userCustomFields } = useUserCustomFields({
    inputTypes: ['select', 'multiselect', 'checkbox', 'number'],
  });

  const { data, isLoading, error } = useVotingPhaseVotes({
    phaseId,
    groupBy: (clusterBy || undefined) as DemographicFieldKey | undefined,
  });

  // Filter to fields that support demographic clustering
  // Backend supports: select, checkbox, multiselect, and birthyear (number type)
  const demographicFields =
    userCustomFields?.data.filter((field) => {
      if (!field.attributes.enabled) return false;
      if (field.attributes.input_type === 'number') {
        // Only birthyear is supported for number fields
        return field.attributes.key === 'birthyear';
      }
      return true;
    }) ?? [];

  const clusterByOptions: IOption[] = [
    {
      value: '',
      label: formatMessage(messages.none),
    },
    ...demographicFields.map((field) => ({
      value: field.attributes.key,
      label: localize(field.attributes.title_multiloc),
    })),
  ];

  if (isLoading) {
    return (
      <Box>
        <Title variant="h3" mb="16px">
          {formatMessage(messages.voteResults)}
        </Title>
        <Text>{formatMessage(messages.loading)}</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Title variant="h3" mb="16px">
          {formatMessage(messages.voteResults)}
        </Title>
        <Text color="error">{formatMessage(messages.errorLoading)}</Text>
      </Box>
    );
  }

  const { ideas, options } = data!.data.attributes;

  const demographicKeys = getDemographicKeys(
    clusterBy || undefined,
    options,
    ideas
  );

  if (ideas.length === 0) {
    return (
      <Box>
        <Title variant="h3" mb="16px">
          {formatMessage(messages.voteResults)}
        </Title>
        <Text>{formatMessage(messages.noResults)}</Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with title and cluster by dropdown */}
      <Box mb="24px">
        <Title variant="h3" mb="16px">
          {formatMessage(messages.voteResults)}
        </Title>

        <Box display="flex" gap="12px" alignItems="flex-end">
          <Box width="200px">
            <Text
              fontSize="xs"
              color="grey700"
              fontWeight="bold"
              mb="4px"
              my="0px"
              style={{ textTransform: 'uppercase' }}
            >
              {formatMessage(messages.clusterBy)}
            </Text>
            <Select
              value={clusterBy}
              options={clusterByOptions}
              onChange={(option) => setClusterBy(option.value)}
            />
          </Box>
        </Box>
      </Box>

      {clusterBy && demographicKeys.length > 0 ? (
        // Clustered view with nested demographic breakdown per idea
        <Box>
          {ideas.map((idea, index) => (
            <React.Fragment key={idea.id}>
              <ClusteredIdeaRow
                idea={idea}
                demographicKeys={demographicKeys}
                clusterBy={clusterBy}
                options={options}
              />
              {index < ideas.length - 1 && (
                <Box borderBottom={`1px solid ${colors.divider}`} />
              )}
            </React.Fragment>
          ))}
        </Box>
      ) : (
        // Non-clustered view: simple list
        <Box>
          {ideas.map((idea) => (
            <VotingIdeaRow key={idea.id} idea={idea} />
          ))}
        </Box>
      )}

      <Box
        display="flex"
        gap="24px"
        mt="24px"
        pt="16px"
        borderTop={`1px solid ${theme.colors.divider}`}
      >
        <Box display="flex" alignItems="center" gap="8px">
          <Box
            w="16px"
            h="12px"
            borderRadius="2px"
            background={INSIGHTS_CHART_COLORS.darkBlue}
          />
          <Text m="0" fontSize="s" color="textSecondary">
            {formatMessage(messages.online)}
          </Text>
        </Box>
        <Box display="flex" alignItems="center" gap="8px">
          <Box
            w="16px"
            h="12px"
            borderRadius="2px"
            style={{ backgroundImage: getStripedPattern() }}
          />
          <Text m="0" fontSize="s" color="textSecondary">
            {formatMessage(messages.offline)}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default VoteResults;
