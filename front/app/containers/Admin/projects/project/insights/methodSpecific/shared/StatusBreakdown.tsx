import React, { useMemo, ReactNode } from 'react';

import { Box, Text, Spinner } from '@citizenlab/cl2-component-library';

import { IdeaStatusParticipationMethod } from 'api/idea_statuses/types';
import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import HorizontalBarRow, { HorizontalBarRowData } from './HorizontalBarRow';
import messages from './messages';

interface StatusBarData extends HorizontalBarRowData {
  ordering: number;
}

const StatusCard = ({ children }: { children: ReactNode }) => (
  <Box
    bgColor="white"
    borderRadius="8px"
    p="24px"
    boxShadow="0px 1px 2px 0px rgba(0,0,0,0.05)"
  >
    {children}
  </Box>
);

interface Props {
  phaseId: string;
  participationMethod: IdeaStatusParticipationMethod;
}

const StatusBreakdown = ({ phaseId, participationMethod }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const { data: filterCounts, isLoading: isLoadingCounts } =
    useIdeasFilterCounts({
      phase: phaseId,
    });

  const { data: statuses, isLoading: isLoadingStatuses } = useIdeaStatuses({
    queryParams: { participation_method: participationMethod },
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
      <StatusCard>
        <Box display="flex" alignItems="center" gap="8px">
          <Spinner size="24px" />
        </Box>
      </StatusCard>
    );
  }

  if (statusData.length === 0) {
    return (
      <StatusCard>
        <Text
          m="0"
          mb="16px"
          fontWeight="semi-bold"
          fontSize="m"
          color="primary"
        >
          {formatMessage(messages.statusBreakdown)}
        </Text>
        <Text m="0" color="textSecondary">
          {formatMessage(messages.noInputsSubmitted)}
        </Text>
      </StatusCard>
    );
  }

  return (
    <StatusCard>
      <Text m="0" mb="24px" fontWeight="semi-bold" fontSize="m" color="primary">
        {formatMessage(messages.statusBreakdown)}
      </Text>
      <Box display="flex" flexDirection="column" gap="16px">
        {statusData.map((status) => (
          <HorizontalBarRow key={status.id} data={status} maxCount={maxCount} />
        ))}
      </Box>
    </StatusCard>
  );
};

export default StatusBreakdown;
