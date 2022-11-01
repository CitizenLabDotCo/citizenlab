import React, { useRef } from 'react';

// hooks
import useActiveUsers from '../../hooks/useActiveUsers';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box } from '@citizenlab/cl2-component-library';
import Statistic from 'components/admin/Graphs/Statistic';
import Chart from './Chart';
import {
  STATS_CONTAINER_LAYOUT,
  GRAPHS_OUTER_LAYOUT,
  GRAPHS_INNER_LAYOUT,
} from '../RegistrationsCard/layouts';

// i18n
import messages from './messages';
import moduleMessages from '../../messages';
import { useIntl } from 'utils/cl-intl';
import {
  getTimePeriodTranslations,
  RESOLUTION_TO_MESSAGE_KEY,
} from '../../utils/resolution';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { emptyStatsData } from './generateEmptyData';

// typings
import { ProjectId, Dates, Resolution, Layout } from '../../typings';

type Props = ProjectId &
  Dates &
  Resolution & {
    layout?: Layout;
  };

const ActiveUsersCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
  layout = 'wide',
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();
  const { timeSeries, stats, xlsxData, deducedResolution } = useActiveUsers({
    projectId,
    startAtMoment,
    endAtMoment,
    resolution,
  });

  if (isNilOrError(stats)) {
    return null;
  }

  const cardTitle = formatMessage(messages.activeUsers);
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();
  const timePeriodTranslations = getTimePeriodTranslations(formatMessage);
  const bottomLabel =
    timePeriodTranslations[RESOLUTION_TO_MESSAGE_KEY[resolution]];

  const shownStatsData = projectId ? emptyStatsData : stats;

  return (
    <GraphCard
      title={cardTitle}
      infoTooltipContent={formatMessage(messages.cardTitleTooltipMessage)}
      exportMenu={{
        name: cardTitle,
        svgNode: graphRef,
        xlsx: isNilOrError(xlsxData) ? undefined : { data: xlsxData },
        startAt,
        endAt,
        resolution: deducedResolution,
      }}
    >
      <Box display="flex" flexDirection={layout === 'wide' ? 'row' : 'column'}>
        <Box
          width="initial"
          display="flex"
          pl="20px"
          flexDirection={layout === 'narrow' ? 'row' : 'column'}
        >
          <Box width={layout === 'narrow' ? '50%' : undefined}>
            <Statistic
              name={formatMessage(messages.totalActiveUsers)}
              value={shownStatsData.activeUsers.value}
              bottomLabel={bottomLabel}
              bottomLabelValue={shownStatsData.activeUsers.lastPeriod}
            />
          </Box>
          <Box {...STATS_CONTAINER_LAYOUT[layout]}>
            <Statistic
              name={formatMessage(moduleMessages.conversionRate)}
              value={shownStatsData.conversionRate.value}
              bottomLabel={bottomLabel}
              bottomLabelValue={shownStatsData.conversionRate.lastPeriod}
            />
          </Box>
        </Box>
        <Box {...GRAPHS_OUTER_LAYOUT[layout]}>
          <Box pt="8px" height="250px" {...GRAPHS_INNER_LAYOUT[layout]}>
            <Chart
              timeSeries={timeSeries}
              projectId={projectId}
              startAtMoment={startAtMoment}
              endAtMoment={endAtMoment}
              resolution={deducedResolution}
              innerRef={graphRef}
              layout={layout}
            />
          </Box>
        </Box>
      </Box>
    </GraphCard>
  );
};

export default ActiveUsersCard;
