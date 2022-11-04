import React from 'react';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box, colors } from '@citizenlab/cl2-component-library';
import EmptyState from 'components/admin/Graphs/_components/EmptyState';
import Statistic from 'components/admin/Graphs/Statistic';

// hooks
import useProposals from '../../hooks/useProposals';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { useIntl } from 'utils/cl-intl';
import { getLabels } from '../../hooks/useProposals/utils';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { Moment } from 'moment';

interface Props {
  projectId: string | undefined;
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null | undefined;
  resolution: IResolution;
}

const ProposalsCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: Props) => {
  const data = useProposals({
    projectId,
    startAtMoment,
    endAtMoment,
    resolution,
  });
  const { formatMessage } = useIntl();

  const labels = getLabels(formatMessage, resolution);

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
        name: labels.cardTitle.toLowerCase().replace(' ', '_'),
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
            value={chartData.totalProposals.value}
            bottomLabel={labels.period}
            bottomLabelValue={chartData.totalProposals.lastPeriod}
          />
        </Box>
        <Box pl="20px" width="100%">
          <Statistic
            name={labels.successful}
            value={chartData.successfulProposals.value}
            bottomLabel={labels.period}
            bottomLabelValue={chartData.successfulProposals.lastPeriod}
            tooltipContent={labels.successfulToolTip}
          />
        </Box>
      </Box>
    </GraphCard>
  );
};

export default ProposalsCard;
