import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import { ParticipationType } from 'api/graph_data_units/requestTypes';

import { AccessibilityProps } from 'components/admin/Graphs/typings';

import { useIntl } from 'utils/cl-intl';

import A11yTable from '../../_shared/A11yTable';
import { formatLargeNumber, getDaysInRange } from '../../utils';
import messages from '../messages';

import Chart from './Chart';
import { Statistic } from './Statistics';
import { Props } from './Wide';

const Narrow = ({
  startAt,
  endAt,
  currentResolution,
  stats,
  timeSeries,
  hideStatistics,
  participationTypes,
  ariaLabel,
  ariaDescribedBy,
}: Props & AccessibilityProps) => {
  const previousDays = getDaysInRange(startAt, endAt);
  const show = (type: ParticipationType) => participationTypes[type];
  const accessibilityProps = {
    ariaLabel,
    ariaDescribedBy,
  };
  const { formatMessage } = useIntl();

  const columns = [
    {
      key: 'date',
      label: formatMessage(messages.dateColumn),
      render: (value) => moment(value).format('MMM DD, YYYY'),
    },
  ];
  if (show('inputs')) {
    columns.push({
      key: 'inputs',
      label: formatMessage(messages.inputs),
      render: (value) => (value != null ? value.toString() : ''),
    });
  }
  if (show('comments')) {
    columns.push({
      key: 'comments',
      label: formatMessage(messages.comments),
      render: (value) => (value != null ? value.toString() : ''),
    });
  }
  if (show('votes')) {
    columns.push({
      key: 'votes',
      label: formatMessage(messages.votes),
      render: (value) => (value != null ? value.toString() : ''),
    });
  }

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {!hideStatistics && stats && (
        <Box display="flex" flexDirection="column" mb="8px">
          {show('inputs') && (
            <Statistic
              nameMessage={messages.inputs}
              {...stats.inputs}
              previousDays={previousDays}
            />
          )}
          {show('comments') && (
            <Box mt={show('inputs') ? '12px' : undefined}>
              <Statistic
                nameMessage={messages.comments}
                {...stats.comments}
                previousDays={previousDays}
              />
            </Box>
          )}
          {show('votes') && (
            <Box mt={show('inputs') || show('comments') ? '12px' : undefined}>
              <Statistic
                nameMessage={messages.votes}
                {...stats.votes}
                previousDays={previousDays}
              />
            </Box>
          )}
        </Box>
      )}
      <Box
        flexGrow={1}
        display="flex"
        justifyContent="flex-end"
        height="200px"
        mt="8px"
      >
        <Chart
          timeSeries={timeSeries}
          startAtMoment={startAt ? moment(startAt) : null}
          endAtMoment={endAt ? moment(endAt) : null}
          resolution={currentResolution}
          margin={{
            left: 5,
            right: -20,
            top: 0,
            bottom: 0,
          }}
          yaxis={{
            orientation: 'right',
            tickFormatter: formatLargeNumber,
          }}
          participationTypes={participationTypes}
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
