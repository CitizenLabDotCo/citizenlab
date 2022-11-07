import React from 'react';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box, colors } from '@citizenlab/cl2-component-library';
import EmptyState from 'components/admin/Graphs/_components/EmptyState';
import Statistic from 'components/admin/Graphs/Statistic';

// hooks
import useInvitations from '../../hooks/useInvitations';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { useIntl } from 'utils/cl-intl';

// typings
import { StatCardPeriodProps } from '../../typings';
import { getInvitationsLabels } from '../../hooks/useInvitations/utils';

const InvitationsCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: StatCardPeriodProps) => {
  const data = useInvitations({
    projectId,
    startAtMoment,
    endAtMoment,
    resolution,
  });
  const { formatMessage } = useIntl();

  const labels = getInvitationsLabels(formatMessage, resolution);

  if (isNilOrError(data)) {
    return (
      <GraphCard title={labels.cardTitle}>
        <EmptyState />
      </GraphCard>
    );
  }

  const { chartData, xlsxData } = data;
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  return (
    <GraphCard
      title={labels.cardTitle}
      exportMenu={{
        name: labels.fileName,
        xlsx: { data: xlsxData },
        currentProjectFilter: projectId,
        startAt,
        endAt,
        resolution,
      }}
    >
      <Box width="100%" display="flex" flexDirection="row" pl="20px">
        <Box pr="20px" width="100%" borderRight={`1px solid ${colors.divider}`}>
          <Statistic
            name={labels.total}
            value={chartData.totalInvites.value}
            bottomLabel={labels.total}
            bottomLabelValue={chartData.totalInvites.lastPeriod}
          />
        </Box>
        <Box pl="20px" width="100%" borderRight={`1px solid ${colors.divider}`}>
          <Statistic
            name={labels.pending}
            value={chartData.pendingInvites.value}
          />
        </Box>
        <Box pl="20px" width="100%">
          <Statistic
            name={labels.accepted}
            value={chartData.acceptedInvites.value}
            bottomLabel={labels.period}
            bottomLabelValue={chartData.acceptedInvites.lastPeriod}
          />
        </Box>
      </Box>
    </GraphCard>
  );
};

export default InvitationsCard;
