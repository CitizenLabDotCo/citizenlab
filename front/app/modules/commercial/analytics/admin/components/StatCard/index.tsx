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
import { StatCardQueryParameters } from '../../hooks/useStatCard/typings';

const StatCard = ({
  query,
  parseChartData,
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: StatCardQueryParameters) => {
  const data = useStatCard({
    query,
    parseChartData,
    projectId,
    startAtMoment,
    endAtMoment,
    resolution,
  });

  // TODO: How do we get the title if data object is error
  if (isNilOrError(data)) {
    return (
      <GraphCard title="title">
        <EmptyState />
      </GraphCard>
    );
  }

  const { chartData, xlsxData } = data;
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  const displayStats: ReactElement[] = [];
  chartData.stats.forEach((stat) => {
    displayStats.push(
      // TODO: Sort out the right border here
      <Box pr="20px" width="100%" borderRight={`1px solid ${colors.divider}`}>
        <Statistic
          name={stat.label}
          value={stat.value}
          bottomLabel={chartData.periodLabel}
          bottomLabelValue={stat.lastPeriod}
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
