import React, { ReactElement } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import GraphCard from 'components/admin/GraphCard';
import EmptyState from 'components/admin/Graphs/_components/EmptyState';
import Statistic from 'components/admin/Graphs/Statistic';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import useStatCard from './useStatCard';
import { StatCardTemplateProps } from './useStatCard/typings';

const StatCard = ({
  config,
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
  showExportMenu = true,
  alignItems = 'stretch',
}: StatCardTemplateProps) => {
  const data = useStatCard({
    messages: config.messages,
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

  // Extract the corner stat if there is one (can only deal with one!)
  let cornerStat: string | undefined = undefined;
  cardData.stats.forEach((stat, index) => {
    if (stat.display === 'corner') {
      cornerStat = `${stat.label}: ${stat.value}`;
      cardData.stats.splice(index, 1);
    }
  });

  // Format the stat columns
  const columnStats: ReactElement[] = [];
  cardData.stats.forEach((stat, index, arr) => {
    columnStats.push(
      <Box
        pr="10px"
        pl="10px"
        width="100%"
        key={index}
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

  const exportMenu = showExportMenu
    ? {
        name: cardData.fileName,
        xlsx: { data: xlsxData },
        currentProjectFilter: projectId,
        startAt,
        endAt,
        resolution,
      }
    : undefined;

  return (
    <GraphCard
      title={cardData.cardTitle}
      exportMenu={exportMenu}
      topRightStat={cornerStat}
    >
      <Box
        width="100%"
        display="flex"
        flexDirection="row"
        pl="20px"
        alignItems={alignItems}
      >
        {columnStats}
      </Box>
    </GraphCard>
  );
};

export default StatCard;
