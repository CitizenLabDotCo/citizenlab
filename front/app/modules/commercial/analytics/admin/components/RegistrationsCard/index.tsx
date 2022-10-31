import React, { useRef } from 'react';

// hooks
import useRegistrations from '../../hooks/useRegistrations';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box } from '@citizenlab/cl2-component-library';
import Statistic from 'components/admin/Graphs/Statistic';
import Chart from './Chart';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';
import {
  getTimePeriodTranslations,
  RESOLUTION_TO_MESSAGE_KEY,
} from '../../utils/resolution';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { emptyStatsData } from './generateEmptyData';

// typings
import { ProjectId, Dates, Resolution } from '../../typings';
import { Layout, BoxLayout } from '../../typings';

type Props = ProjectId &
  Dates &
  Resolution & {
    layout?: Layout;
  };

const STATS_CONTAINER_LAYOUT: BoxLayout = {
  wide: { mt: '32px' },
  narrow: { ml: '32px', width: '50%' },
};

const GRAPHS_OUTER_LAYOUT: BoxLayout = {
  wide: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    pr: '20px',
  },
  narrow: {
    width: '100%',
    mt: '20px',
  },
};

const GRAPHS_INNER_LAYOUT: BoxLayout = {
  wide: {
    width: '95%',
    maxWidth: '800px',
    mt: '-1px',
  },
  narrow: { width: '100%' },
};

const RegistrationsCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
  layout = 'wide',
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();
  const { timeSeries, stats, xlsxData, deducedResolution } = useRegistrations({
    startAtMoment,
    endAtMoment,
    resolution,
  });

  if (isNilOrError(stats)) {
    return null;
  }

  const cardTitle = formatMessage(messages.registrations);
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();
  const timePeriodTranslations = getTimePeriodTranslations(formatMessage);
  const bottomLabel =
    timePeriodTranslations[RESOLUTION_TO_MESSAGE_KEY[resolution]];

  const shownStatsData = projectId ? emptyStatsData : stats;

  return (
    <GraphCard
      title={cardTitle}
      exportMenu={{
        name: cardTitle,
        svgNode: graphRef,
        xlsx: !isNilOrError(xlsxData) ? { data: xlsxData } : undefined,
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
              name={formatMessage(messages.totalRegistrations)}
              value={shownStatsData.registrations.value}
              bottomLabel={bottomLabel}
              bottomLabelValue={shownStatsData.registrations.lastPeriod}
            />
          </Box>
          <Box {...STATS_CONTAINER_LAYOUT[layout]}>
            <Statistic
              name={formatMessage(messages.conversionRate)}
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

export default RegistrationsCard;
