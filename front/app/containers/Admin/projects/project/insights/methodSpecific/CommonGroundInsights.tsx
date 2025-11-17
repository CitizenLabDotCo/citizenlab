import React, { useState } from 'react';

import { Box, Text, Title, Select } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import { SortOption } from 'api/phase_insights/types';
import useCommonGroundInsights from 'api/phase_insights/useCommonGroundInsights';

import useLocale from 'hooks/useLocale';

import Statistics from 'containers/ProjectsShowPage/timeline/CommonGround/CommonGroundResults/Statistics';
import OutcomeBreakdownBar from 'containers/ProjectsShowPage/timeline/CommonGround/OutcomeBreakdownBar';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';

import { MethodSpecificInsightProps } from './types';

type ClusterByOption = '' | 'gender' | 'birthyear' | 'domicile';

const CommonGroundInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const [sortBy, setSortBy] = useState<SortOption>('most_agreed');
  const [clusterBy, setClusterBy] = useState<ClusterByOption>('');

  // Fetch data using the hook
  const { data, isLoading, error } = useCommonGroundInsights({
    phaseId,
    groupBy: clusterBy || undefined,
  });

  if (isLoading) {
    return (
      <Box mt="8px" bg="white" p="30px">
        <Text>Loading...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt="8px" bg="white" p="30px">
        <Text color="error">Error loading Common Ground results</Text>
      </Box>
    );
  }

  const {
    stats,
    total_count,
    items: unsortedItems,
    demographic_field,
  } = data!.data.attributes;

  // Sort items based on selected sort option
  const items = [...unsortedItems].sort((a, b) => {
    const aTotal = a.votes.up + a.votes.down + a.votes.neutral;
    const bTotal = b.votes.up + b.votes.down + b.votes.neutral;

    switch (sortBy) {
      case 'most_agreed': {
        const aPercent = aTotal > 0 ? (a.votes.up / aTotal) * 100 : 0;
        const bPercent = bTotal > 0 ? (b.votes.up / bTotal) * 100 : 0;
        return bPercent - aPercent; // Higher percentage first
      }
      case 'most_disagreed': {
        const aPercent = aTotal > 0 ? (a.votes.down / aTotal) * 100 : 0;
        const bPercent = bTotal > 0 ? (b.votes.down / bTotal) * 100 : 0;
        return bPercent - aPercent; // Higher percentage first
      }
      case 'most_controversial': {
        // Most controversial = closest to 50/50 split between agree and disagree
        const aAgreePercent = aTotal > 0 ? (a.votes.up / aTotal) * 100 : 0;
        const bAgreePercent = bTotal > 0 ? (b.votes.up / bTotal) * 100 : 0;
        const aControversy = Math.abs(50 - aAgreePercent);
        const bControversy = Math.abs(50 - bAgreePercent);
        return aControversy - bControversy; // Lower difference from 50% = more controversial
      }
      case 'newest': {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      default:
        return 0;
    }
  });

  const totalVotes = stats.votes.up + stats.votes.down + stats.votes.neutral;

  // Sort options
  const sortOptions: IOption[] = [
    {
      value: 'most_agreed',
      label: formatMessage({
        id: 'admin.insights.common_ground.sort.most_agreed',
        defaultMessage: 'Most agreed',
      }),
    },
    {
      value: 'most_disagreed',
      label: formatMessage({
        id: 'admin.insights.common_ground.sort.most_disagreed',
        defaultMessage: 'Most disagreed',
      }),
    },
    {
      value: 'most_controversial',
      label: formatMessage({
        id: 'admin.insights.common_ground.sort.most_controversial',
        defaultMessage: 'Most controversial',
      }),
    },
    {
      value: 'newest',
      label: formatMessage({
        id: 'admin.insights.common_ground.sort.newest',
        defaultMessage: 'Newest',
      }),
    },
  ];

  // Cluster by options
  const clusterByOptions: IOption[] = [
    {
      value: '',
      label: formatMessage({
        id: 'admin.insights.common_ground.cluster.none',
        defaultMessage: 'None',
      }),
    },
    {
      value: 'gender',
      label: formatMessage({
        id: 'admin.insights.common_ground.cluster.gender',
        defaultMessage: 'Gender',
      }),
    },
    {
      value: 'birthyear',
      label: formatMessage({
        id: 'admin.insights.common_ground.cluster.age',
        defaultMessage: 'Age',
      }),
    },
    {
      value: 'domicile',
      label: formatMessage({
        id: 'admin.insights.common_ground.cluster.location',
        defaultMessage: 'Location',
      }),
    },
  ];

  // Calculate percentages for a vote object
  const calculatePercentages = (votes: {
    up: number;
    down: number;
    neutral: number;
  }) => {
    const total = votes.up + votes.down + votes.neutral;
    if (total === 0) {
      return {
        agreedPercent: 0,
        disagreePercent: 0,
        unsurePercent: 0,
        total: 0,
      };
    }

    return {
      agreedPercent: Math.round((votes.up / total) * 100),
      disagreePercent: Math.round((votes.down / total) * 100),
      unsurePercent: Math.round((votes.neutral / total) * 100),
      total,
    };
  };

  // Get demographic label
  const getDemographicLabel = (key: string) => {
    if (clusterBy === 'birthyear') {
      return key; // Age ranges are displayed as-is
    }

    if (demographic_field?.options?.[key]) {
      const option = demographic_field.options[key];
      return option.title_multiloc[locale] || option.title_multiloc.en || key;
    }

    return key;
  };

  // Get demographic keys in order
  const getDemographicKeys = () => {
    if (!demographic_field) return [];

    if (clusterBy === 'birthyear') {
      return ['16-24', '25-34', '35-44', '45-54', '55-64', '65+'];
    }

    if (!demographic_field.options) return [];

    return Object.entries(demographic_field.options)
      .sort(([, a], [, b]) => a.ordering - b.ordering)
      .map(([key]) => key);
  };

  const demographicKeys = getDemographicKeys();

  return (
    <Box mt="8px" bg="white" p="30px 30px 48px 30px">
      <Statistics
        numOfParticipants={stats.num_participants}
        numOfIdeas={stats.num_ideas}
        totalVotes={totalVotes}
      />

      {/* Header with title and filters */}
      <Box mb="24px">
        <Title variant="h3" mb="16px">
          {formatMessage(
            {
              id: 'admin.insights.common_ground.all_statements',
              defaultMessage: 'All statements ({count})',
            },
            { count: total_count }
          )}
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
              {formatMessage({
                id: 'admin.insights.common_ground.sort_by',
                defaultMessage: 'SORT BY',
              })}
            </Text>
            <Select
              value={sortBy}
              options={sortOptions}
              onChange={(option) => setSortBy(option.value as SortOption)}
            />
          </Box>

          <Box width="200px">
            <Text
              fontSize="xs"
              color="grey700"
              fontWeight="bold"
              mb="4px"
              my="0px"
              style={{ textTransform: 'uppercase' }}
            >
              {formatMessage({
                id: 'admin.insights.common_ground.cluster_by',
                defaultMessage: 'CLUSTER BY',
              })}
            </Text>
            <Select
              value={clusterBy}
              options={clusterByOptions}
              onChange={(option) =>
                setClusterBy(option.value as ClusterByOption)
              }
            />
          </Box>

          <Box width="200px">
            <Text
              fontSize="xs"
              color="grey700"
              fontWeight="bold"
              mb="4px"
              my="0px"
              style={{ textTransform: 'uppercase' }}
            >
              {formatMessage({
                id: 'admin.insights.common_ground.filter_by',
                defaultMessage: 'FILTER BY',
              })}
            </Text>
            <Select
              value="all"
              options={[
                {
                  value: 'all',
                  label: formatMessage({
                    id: 'admin.insights.common_ground.filter.all_users',
                    defaultMessage: 'All users',
                  }),
                },
              ]}
              onChange={() => {}}
              disabled
            />
          </Box>
        </Box>
      </Box>

      {/* Statements list container with horizontal scroll */}
      <Box overflow="auto">
        <Box>
          {/* Demographic column headers */}
          {clusterBy && demographicKeys.length > 0 && (
            <Box display="flex" gap="8px" mb="12px">
              <Box width="60%" flexShrink={0} />
              <Box display="flex" gap="8px" flex="1">
                {demographicKeys.map((key) => (
                  <Box key={key} width="150px" flexShrink={0}>
                    <Text
                      fontSize="xs"
                      color="grey700"
                      fontWeight="bold"
                      textAlign="center"
                      my="0px"
                    >
                      {getDemographicLabel(key)}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Statements list */}
          <Box>
            {items.map((item) => {
              const overallStats = calculatePercentages(item.votes);

              return (
                <Box
                  key={item.id}
                  py="16px"
                  borderBottom="1px solid"
                  borderColor="divider"
                >
                  <Box display="flex" gap="8px" alignItems="flex-start">
                    {/* Statement text */}
                    <Box width="60%" flexShrink={0}>
                      <Text fontSize="m" my="0px">
                        <T value={item.title_multiloc} />
                      </Text>
                    </Box>

                    {/* Overall or clustered breakdown */}
                    {!clusterBy ? (
                      // No clustering - show single breakdown bar
                      <Box width="200px" flexShrink={0}>
                        <OutcomeBreakdownBar
                          agreedPercent={overallStats.agreedPercent}
                          unsurePercent={overallStats.unsurePercent}
                          disagreePercent={overallStats.disagreePercent}
                          totalCount={overallStats.total}
                        />
                      </Box>
                    ) : (
                      // With clustering - show breakdown per demographic
                      <Box display="flex" gap="8px" flex="1">
                        {demographicKeys.map((key) => {
                          const demographicVotes =
                            item.demographic_breakdown?.[key];
                          if (!demographicVotes) {
                            return (
                              <Box key={key} width="150px" flexShrink={0}>
                                <Text
                                  fontSize="xs"
                                  color="grey500"
                                  textAlign="center"
                                  my="0px"
                                >
                                  -
                                </Text>
                              </Box>
                            );
                          }

                          const stats = calculatePercentages(demographicVotes);

                          return (
                            <Box key={key} width="150px" flexShrink={0}>
                              <OutcomeBreakdownBar
                                agreedPercent={stats.agreedPercent}
                                unsurePercent={stats.unsurePercent}
                                disagreePercent={stats.disagreePercent}
                                totalCount={stats.total}
                              />
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CommonGroundInsights;
