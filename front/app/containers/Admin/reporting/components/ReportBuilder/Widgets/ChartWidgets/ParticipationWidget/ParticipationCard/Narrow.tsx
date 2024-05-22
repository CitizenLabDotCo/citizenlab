import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import { ParticipationType } from 'api/graph_data_units/requestTypes';

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
}: Props) => {
  const previousDays = getDaysInRange(startAt, endAt);
  const show = (type: ParticipationType) => participationTypes.includes(type);
  const showInputs = show('inputs');
  const showComments = show('comments');

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {!hideStatistics && stats && (
        <Box display="flex" flexDirection="column" mb="8px">
          {showInputs && (
            <Statistic
              nameMessage={messages.inputs}
              {...stats.inputs}
              previousDays={previousDays}
            />
          )}
          {showComments && (
            <Box mt={showInputs ? '12px' : undefined}>
              <Statistic
                nameMessage={messages.comments}
                {...stats.comments}
                previousDays={previousDays}
              />
            </Box>
          )}
          {show('votes') && (
            <Box mt={showInputs || showComments ? '12px' : undefined}>
              <Statistic
                nameMessage={messages.votes}
                {...stats.votes}
                previousDays={previousDays}
              />
            </Box>
          )}
        </Box>
      )}

      <Box flexGrow={1} display="flex" justifyContent="flex-end" height="200px">
        <Box pt="8px" width="100%" maxWidth="800px" h="100%">
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
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Narrow;
