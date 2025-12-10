import React, { useState } from 'react';

import { Box, Text, Title, Select } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';
import { IOption } from 'typings';

import { GroupByOption } from 'api/voting_insights/types';
import useVotingPhaseVotes from 'api/voting_insights/useVotingPhaseVotes';

import useLocale from 'hooks/useLocale';

import { useIntl } from 'utils/cl-intl';

import { CHART_COLORS, getStripedPattern } from './constants';
import messages from './messages';
import VotingIdeaRow from './VotingIdeaRow';

type ClusterByOption = '' | 'gender' | 'birthyear' | 'domicile';

interface Props {
  phaseId: string;
}

const VoteResults = ({ phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const theme = useTheme();
  const [clusterBy, setClusterBy] = useState<ClusterByOption>('');

  const { data, isLoading, error } = useVotingPhaseVotes({
    phaseId,
    groupBy: (clusterBy || undefined) as GroupByOption | undefined,
  });

  const clusterByOptions: IOption[] = [
    {
      value: '',
      label: formatMessage(messages.none),
    },
    {
      value: 'gender',
      label: formatMessage(messages.gender),
    },
    {
      value: 'birthyear',
      label: formatMessage(messages.age),
    },
    {
      value: 'domicile',
      label: formatMessage(messages.location),
    },
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

  // Get demographic keys in order
  const getDemographicKeys = (): string[] => {
    if (!clusterBy) return [];

    // For birthyear, we use predefined age ranges (no options from backend)
    if (clusterBy === 'birthyear') {
      return ['16-24', '25-34', '35-44', '45-54', '55-64', '65+'];
    }

    // For other demographics (gender, domicile), use options from backend
    if (!options) return [];

    return Object.entries(options)
      .sort(([, a], [, b]) => a.ordering - b.ordering)
      .map(([key]) => key);
  };

  // Get demographic label
  const getDemographicLabel = (key: string): string => {
    if (clusterBy === 'birthyear') {
      return key;
    }

    if (options?.[key]) {
      const option = options[key];
      return option.title_multiloc[locale] || option.title_multiloc.en || key;
    }

    return key;
  };

  const demographicKeys = getDemographicKeys();
  const maxVotes = Math.max(...ideas.map((idea) => idea.total_votes), 0);

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
              onChange={(option) =>
                setClusterBy(option.value as ClusterByOption)
              }
            />
          </Box>
        </Box>
      </Box>

      {/* Ideas list - different layout for clustered vs non-clustered */}
      {clusterBy && demographicKeys.length > 0 ? (
        // Clustered view with demographic columns
        <Box>
          {ideas.map((idea) => (
            <VotingIdeaRow
              key={idea.id}
              idea={idea}
              maxVotes={maxVotes}
              clusterBy={clusterBy}
              demographicKeys={demographicKeys}
              demographicLabels={demographicKeys.map(getDemographicLabel)}
            />
          ))}
        </Box>
      ) : (
        // Non-clustered view: simple list
        <Box>
          {ideas.map((idea) => (
            <VotingIdeaRow key={idea.id} idea={idea} maxVotes={maxVotes} />
          ))}
        </Box>
      )}

      {/* Legend */}
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
            style={{ backgroundColor: CHART_COLORS.darkBlue }}
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
            {formatMessage(messages.inPerson)}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default VoteResults;
