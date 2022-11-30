import React, { useRef } from 'react';

// hooks
import useActiveUsers from '../../hooks/useActiveUsers';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box } from '@citizenlab/cl2-component-library';
import Statistic from 'components/admin/Graphs/Statistic';
import Chart from './Chart';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';
import { getTimePeriodTranslationByResolution } from '../../utils/resolution';

// utils
import { isNilOrError } from 'utils/helperUtils';

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
  const bottomLabel = getTimePeriodTranslationByResolution(
    formatMessage,
    resolution
  );

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
              value={stats.activeUsers.value}
              bottomLabel={bottomLabel}
              bottomLabelValue={stats.activeUsers.lastPeriod}
            />
          </Box>
          <Box
            mt={layout === 'wide' ? '32px' : 'auto'}
            ml={layout === 'narrow' ? '32px' : 'auto'}
            width={layout === 'narrow' ? '50%' : 'auto'}
          >
            <Statistic
              name={formatMessage(messages.participationRate)}
              tooltipContent={formatMessage(messages.participationRateTooltip)}
              value={stats.participationRate.value}
              bottomLabel={bottomLabel}
              bottomLabelValue={stats.participationRate.lastPeriod}
            />
          </Box>
        </Box>
        {layout === 'wide' && (
          <Box flexGrow={1} display="flex" justifyContent="flex-end" pr="20px">
            <Box pt="8px" height="250px" width="95%" maxWidth="800px" mt="-1px">
              <Chart
                timeSeries={timeSeries}
                startAtMoment={startAtMoment}
                endAtMoment={endAtMoment}
                resolution={deducedResolution}
                innerRef={graphRef}
                layout={layout}
              />
            </Box>
          </Box>
        )}

        {layout === 'narrow' && (
          <Box width="100%" height="250px" mt="30px">
            <Chart
              timeSeries={timeSeries}
              startAtMoment={startAtMoment}
              endAtMoment={endAtMoment}
              resolution={deducedResolution}
              innerRef={graphRef}
              layout={layout}
            />
          </Box>
        )}
      </Box>
    </GraphCard>
  );
};

// ts-prune-ignore-next
export default ActiveUsersCard;
