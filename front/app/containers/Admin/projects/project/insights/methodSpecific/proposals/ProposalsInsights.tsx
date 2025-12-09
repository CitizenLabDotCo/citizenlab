import React, { useMemo } from 'react';

import { Box, Text, Spinner } from '@citizenlab/cl2-component-library';

import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import { MethodSpecificInsightProps } from '../types';

import messages from './messages';

interface StatusBarData {
  id: string;
  title: string;
  count: number;
  color: string;
  ordering: number;
}

const ProposalsInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const { data: filterCounts, isLoading: isLoadingCounts } =
    useIdeasFilterCounts({
      phase: phaseId,
    });

  const { data: statuses, isLoading: isLoadingStatuses } = useIdeaStatuses({
    queryParams: { participation_method: 'proposals' },
  });

  const statusData = useMemo((): StatusBarData[] => {
    if (!filterCounts || !statuses) return [];

    const countsByStatusId = filterCounts.data.attributes.idea_status_id;

    return statuses.data
      .filter((status) => {
        const count = countsByStatusId[status.id] || 0;
        return count > 0;
      })
      .map((status) => ({
        id: status.id,
        title: localize(status.attributes.title_multiloc),
        count: countsByStatusId[status.id] || 0,
        color: status.attributes.color,
        ordering: status.attributes.ordering,
      }))
      .sort((a, b) => a.ordering - b.ordering);
  }, [filterCounts, statuses, localize]);

  const maxCount = useMemo(() => {
    if (statusData.length === 0) return 0;
    return Math.max(...statusData.map((s) => s.count));
  }, [statusData]);

  const isLoading = isLoadingCounts || isLoadingStatuses;

  if (isLoading) {
    return (
      <Box
        bgColor="white"
        borderRadius="8px"
        p="24px"
        boxShadow="0px 1px 2px 0px rgba(0,0,0,0.05)"
      >
        <Box display="flex" alignItems="center" gap="8px">
          <Spinner size="24px" />
        </Box>
      </Box>
    );
  }

  if (statusData.length === 0) {
    return (
      <Box
        bgColor="white"
        borderRadius="8px"
        p="24px"
        boxShadow="0px 1px 2px 0px rgba(0,0,0,0.05)"
      >
        <Text
          m="0"
          mb="16px"
          fontWeight="semi-bold"
          fontSize="m"
          color="primary"
        >
          {formatMessage(messages.proposalStatus)}
        </Text>
        <Text m="0" color="textSecondary">
          {formatMessage(messages.noProposalsSubmitted)}
        </Text>
      </Box>
    );
  }

  return (
    <Box
      bgColor="white"
      borderRadius="8px"
      p="24px"
      boxShadow="0px 1px 2px 0px rgba(0,0,0,0.05)"
      w="50%"
    >
      <Text m="0" mb="24px" fontWeight="semi-bold" fontSize="m" color="primary">
        {formatMessage(messages.proposalStatus)}
      </Text>
      <Box display="flex" flexDirection="column" gap="16px">
        {statusData.map((status) => {
          const barWidthPercent =
            maxCount > 0 ? (status.count / maxCount) * 100 : 0;

          return (
            <Box key={status.id}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb="8px"
              >
                <Text
                  m="0"
                  fontSize="s"
                  color="textPrimary"
                  w="50%"
                  style={{ textTransform: 'capitalize' }}
                >
                  {status.title}
                </Text>
                <Text
                  m="0"
                  fontSize="s"
                  fontWeight="semi-bold"
                  style={{ color: status.color }}
                >
                  {status.count}
                </Text>
              </Box>
              <Box
                bgColor="#F3F4F6"
                borderRadius="9999px"
                h="12px"
                overflow="hidden"
              >
                <Box
                  h="100%"
                  borderRadius="9999px"
                  style={{
                    backgroundColor: status.color,
                    width: `${barWidthPercent}%`,
                    minWidth: barWidthPercent > 0 ? '12px' : '0',
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ProposalsInsights;
