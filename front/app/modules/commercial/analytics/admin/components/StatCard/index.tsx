import React, { ReactElement } from 'react';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box, colors } from '@citizenlab/cl2-component-library';
import EmptyState from 'components/admin/Graphs/_components/EmptyState';
import Statistic from 'components/admin/Graphs/Statistic';

// hooks
import useStatCard from '../../hooks/useStatCard';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { StatCardTemplateProps } from '../../hooks/useStatCard/typings';
import { useIntl } from 'utils/cl-intl';

const StatCard = ({
  config,
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: StatCardTemplateProps) => {
  const data = useStatCard({
    queryHandler: config.queryHandler,
    dataParser: config.dataParser,
    projectId,
    startAtMoment,
    endAtMoment,
    resolution,
  });

  const { formatMessage } = useIntl();
  if (isNilOrError(data)) {
    const cardTitle = config.titleGetter(formatMessage);
    return (
      <GraphCard title={cardTitle}>
        <EmptyState />
      </GraphCard>
    );
  }

  const { chartData, xlsxData } = data;
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  // TODO: Add tooltips
  const displayStats: ReactElement[] = [];
  chartData.stats.map((stat, index, arr) => {
    displayStats.push(
      <Box
        pr="20px"
        pl="20px"
        width="100%"
        borderRight={
          index !== arr.length - 1 ? `1px solid ${colors.divider}` : '0'
        }
      >
        <Statistic
          name={stat.label}
          value={stat.value}
          textAlign="center"
          bottomLabel={stat.lastPeriod ? chartData.periodLabel : undefined}
          bottomLabelValue={stat.lastPeriod ? stat.lastPeriod : undefined}
        />
      </Box>
    );
  });

  return (
    <GraphCard
      title={chartData.cardTitle}
      exportMenu={{
        name: chartData.fileName,
        xlsx: { data: xlsxData },
        currentProjectFilter: projectId,
        startAt,
        endAt,
        resolution,
      }}
    >
      <Box width="100%" display="flex" flexDirection="row" pl="20px">
        {displayStats}
      </Box>
    </GraphCard>
  );
};

export default StatCard;
