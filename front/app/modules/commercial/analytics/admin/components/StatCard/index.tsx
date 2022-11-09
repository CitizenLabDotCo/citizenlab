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
    const cardTitle = formatMessage(config.title);
    return (
      <GraphCard title={cardTitle}>
        <EmptyState />
      </GraphCard>
    );
  }

  const { cardData, xlsxData } = data;
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  // TODO: Add tooltips
  const displayStats: ReactElement[] = [];
  cardData.stats.map((stat, index, arr) => {
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
          bottomLabel={stat.lastPeriod ? cardData.periodLabel : undefined}
          bottomLabelValue={stat.lastPeriod}
          tooltipContent={stat.toolTip}
        />
      </Box>
    );
  });

  return (
    <GraphCard
      title={cardData.cardTitle}
      exportMenu={{
        name: cardData.fileName,
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
