import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import Chart from 'components/admin/GraphCards/ParticipantsCard/Chart';
import { TimeSeries } from 'components/admin/GraphCards/ParticipantsCard/useParticipants/typings';
import { DatesStrings } from 'components/admin/GraphCards/typings';
import { AccessibilityProps } from 'components/admin/Graphs/typings';
import { IResolution } from 'components/admin/ResolutionControl';

import { useIntl } from 'utils/cl-intl';

import A11yTable, { Column } from '../../_shared/A11yTable';
import { getDaysInRange } from '../../utils';
import { Stats } from '../typings';

import messages from './messages';
import {
  ParticipantsStatistic,
  ParticipationRateStatistic,
} from './Statistics';

export interface Props extends DatesStrings {
  timeSeries: TimeSeries | null;
  hideStatistics: boolean;
  showVisitors?: boolean;
  stats: Stats;
  currentResolution: IResolution;
}

const Wide = ({
  startAt,
  endAt,
  hideStatistics,
  showVisitors = false,
  timeSeries,
  stats,
  currentResolution,
  ariaLabel,
  ariaDescribedBy,
}: Props & AccessibilityProps) => {
  const previousDays = getDaysInRange(startAt, endAt);
  const { formatMessage } = useIntl();
  const accessibilityProps = {
    ariaLabel,
    ariaDescribedBy,
  };

  // Build columns dynamically based on showVisitors
  const columns: Column[] = [
    {
      key: 'date',
      label: formatMessage(messages.dateColumn),
      type: 'date',
    },
    {
      key: 'participants',
      label: formatMessage(messages.participantsColumn),
    },
  ];

  if (showVisitors) {
    columns.push({
      key: 'visitors',
      label: formatMessage(messages.visitorsColumn),
    });
  }

  return (
    <Box width="100%" pb="8px" display="flex" flexDirection="column">
      <Box
        width="100%"
        height="260px"
        className="e2e-participants-timeline-widget"
        display="flex"
        flexDirection="row"
      >
        {!hideStatistics && (
          <Box>
            <ParticipantsStatistic stats={stats} previousDays={previousDays} />
            <Box mt="32px">
              <ParticipationRateStatistic
                stats={stats}
                previousDays={previousDays}
              />
            </Box>
          </Box>
        )}
        <Box
          flexGrow={1}
          display="flex"
          justifyContent={hideStatistics ? 'flex-start' : 'flex-end'}
          pt="8px"
          maxWidth="800px"
          h="100%"
        >
          <Chart
            timeSeries={timeSeries}
            startAtMoment={startAt ? moment(startAt) : null}
            endAtMoment={endAt ? moment(endAt) : null}
            resolution={currentResolution}
            showVisitors={showVisitors}
            yaxis={hideStatistics ? { orientation: 'right' } : undefined}
            margin={
              hideStatistics
                ? { top: 0, right: -16, bottom: 0, left: 0 }
                : undefined
            }
            {...accessibilityProps}
          />
        </Box>
      </Box>
      <A11yTable
        columns={columns}
        data={timeSeries || []}
        caption={formatMessage(messages.participantsCaption)}
      />
    </Box>
  );
};

export default Wide;
