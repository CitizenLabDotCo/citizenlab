import React from 'react';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box } from '@citizenlab/cl2-component-library';
import EmptyState from 'components/admin/Graphs/_components/EmptyState';
import Statistic from 'components/admin/Graphs/Statistic';

// messages
import { useIntl, MessageDescriptor } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useProposals from '../../hooks/useProposals';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { Moment } from 'moment';

interface Props {
  projectId: string | undefined;
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null | undefined;
  resolution: IResolution;
}

const BOTTOM_LABEL_COPY: Record<IResolution, MessageDescriptor> = {
  month: messages.last30Days,
  week: messages.last7Days,
  day: messages.yesterday,
};

const ProposalsCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: Props) => {
  const { formatMessage } = useIntl();

  const data = useProposals({
    projectId,
    startAtMoment,
    endAtMoment,
    resolution,
  });

  const cardTitle = formatMessage(messages.proposals);

  if (isNilOrError(data)) {
    return (
      <GraphCard title={cardTitle}>
        <EmptyState />
      </GraphCard>
    );
  }

  const { chartData, xlsxData } = data;

  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();
  const bottomLabel = formatMessage(BOTTOM_LABEL_COPY[resolution]);

  return (
    <GraphCard
      title={cardTitle}
      exportMenu={{
        name: cardTitle.toLowerCase().replace(' ', '_'),
        svgNode: [],
        xlsx: { data: xlsxData },
        currentProjectFilter: projectId,
        startAt,
        endAt,
        resolution,
      }}
    >
      <Box>
        <Statistic
          name={formatMessage(messages.totalProposals)}
          value={chartData.totalProposals.value}
          bottomLabel={bottomLabel}
          bottomLabelValue={chartData.totalProposals.lastPeriod}
        />
      </Box>
      <Box>
        <Statistic
          name={formatMessage(messages.successfulProposals)}
          value={chartData.successfulProposals.value}
          bottomLabel={bottomLabel}
          bottomLabelValue={chartData.successfulProposals.value}
          tooltipContent={formatMessage(messages.successfulProposalsToolTip)}
        />
      </Box>
    </GraphCard>
  );
};

export default ProposalsCard;
