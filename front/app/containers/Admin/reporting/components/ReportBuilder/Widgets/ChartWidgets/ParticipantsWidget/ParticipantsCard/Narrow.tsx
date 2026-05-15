import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import Chart from 'components/admin/GraphCards/ParticipantsCard/Chart';
import { AccessibilityProps } from 'components/admin/Graphs/typings';

import { useIntl } from 'utils/cl-intl';

import A11yTable from '../../_shared/A11yTable';
import { getDaysInRange } from '../../utils';

import messages from './messages';
import {
  ParticipantsStatistic,
  ParticipationRateStatistic,
} from './Statistics';
import { Props } from './Wide';

const Narrow = ({
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
  const columns = [
    {
      key: 'date',
      label: formatMessage(messages.dateColumn),
      render: (value) => moment(value).format('MMM DD, YYYY'),
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
    <Box
      w="100%"
      h="100%"
      pb="8px"
      className="e2e-participants-timeline-widget"
      display="flex"
      flexDirection="column"
    >
      {!hideStatistics && (
        <Box mb="8px">
          <ParticipantsStatistic stats={stats} previousDays={previousDays} />
          <Box mt="12px">
            <ParticipationRateStatistic
              stats={stats}
              previousDays={previousDays}
            />
          </Box>
        </Box>
      )}
      <Box display="flex" w="100%" h="200px" mt="8px">
        <Chart
          timeSeries={timeSeries}
          startAtMoment={startAt ? moment(startAt) : null}
          endAtMoment={endAt ? moment(endAt) : null}
          resolution={currentResolution}
          showVisitors={showVisitors}
          margin={{
            left: 5,
            right: -20,
            top: 0,
            bottom: 0,
          }}
          yaxis={{ orientation: 'right' }}
          {...accessibilityProps}
        />
      </Box>

      <A11yTable
        columns={columns}
        data={timeSeries || []}
        caption={formatMessage(messages.participantsCaption)}
      />
    </Box>
  );
};

export default Narrow;
