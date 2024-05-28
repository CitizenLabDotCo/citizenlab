import React, { useRef } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import GraphCard from 'components/admin/GraphCard';
import { getTimePeriodTranslationByResolution } from 'components/admin/GraphCards/_utils/resolution';
import {
  ProjectId,
  Dates,
  Resolution,
  Layout,
} from 'components/admin/GraphCards/typings';
import Statistic from 'components/admin/Graphs/Statistic';

import { useIntl } from 'utils/cl-intl';

import { MARGINS } from '../_utils/style';

import Chart from './Chart';
import messages from './messages';
import useActiveUsers from './useActiveUsers';

type Props = ProjectId &
  Dates &
  Resolution & {
    layout?: Layout;
    hideParticipationRate?: boolean;
  };

const ActiveUsersCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
  layout = 'wide',
  hideParticipationRate = false,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();
  const { timeSeries, stats, xlsxData, currentResolution } = useActiveUsers({
    projectId,
    startAtMoment,
    endAtMoment,
    resolution,
  });

  const cardTitle = formatMessage(messages.participants);
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();
  const bottomLabel = getTimePeriodTranslationByResolution(
    formatMessage,
    resolution
  );

  return (
    <GraphCard
      title={cardTitle}
      id="e2e-participants-by-time-chart"
      infoTooltipContent={formatMessage(messages.cardTitleTooltipMessage)}
      exportMenu={{
        name: cardTitle,
        svgNode: graphRef,
        xlsx: xlsxData ? { data: xlsxData } : undefined,
        startAt,
        endAt,
        resolution: currentResolution,
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
              name={formatMessage(messages.totalParticipants)}
              value={stats?.activeUsers.value ?? '-'}
              bottomLabel={bottomLabel}
              bottomLabelValue={stats?.activeUsers.lastPeriod ?? '-'}
            />
          </Box>
          {!hideParticipationRate && (
            <Box
              mt={layout === 'wide' ? '32px' : 'auto'}
              ml={layout === 'narrow' ? '32px' : 'auto'}
              width={layout === 'narrow' ? '50%' : 'auto'}
            >
              <Statistic
                name={formatMessage(messages.participationRate)}
                tooltipContent={formatMessage(
                  messages.participationRateTooltip
                )}
                value={stats?.participationRate.value ?? '-'}
                bottomLabel={bottomLabel}
                bottomLabelValue={stats?.participationRate.lastPeriod ?? '-'}
              />
            </Box>
          )}
        </Box>
        {layout === 'wide' && (
          <Box flexGrow={1} display="flex" justifyContent="flex-end" pr="20px">
            <Box pt="8px" height="250px" width="95%" maxWidth="800px" mt="-1px">
              <Chart
                timeSeries={timeSeries}
                startAtMoment={startAtMoment}
                endAtMoment={endAtMoment}
                resolution={currentResolution}
                innerRef={graphRef}
                margin={MARGINS.wide}
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
              resolution={currentResolution}
              innerRef={graphRef}
              margin={MARGINS.narrow}
            />
          </Box>
        )}
      </Box>
    </GraphCard>
  );
};

// ts-prune-ignore-next
export default ActiveUsersCard;
