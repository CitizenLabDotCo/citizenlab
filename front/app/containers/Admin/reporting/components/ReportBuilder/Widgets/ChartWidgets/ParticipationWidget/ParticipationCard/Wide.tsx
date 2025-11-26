import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import { ParticipationType } from 'api/graph_data_units/requestTypes';

import { DatesStrings } from 'components/admin/GraphCards/typings';
import { AccessibilityProps } from 'components/admin/Graphs/typings';
import { IResolution } from 'components/admin/ResolutionControl';

import { getDaysInRange, formatLargeNumber } from '../../utils';
import messages from '../messages';
import { CombinedTimeSeriesRow, Stats } from '../typings';

import Chart from './Chart';
import { Statistic } from './Statistics';

export interface Props extends DatesStrings {
  timeSeries: CombinedTimeSeriesRow[] | null;
  hideStatistics: boolean;
  stats: Stats | null;
  currentResolution: IResolution;
  participationTypes: Record<ParticipationType, boolean>;
}

const Wide = ({
  startAt,
  endAt,
  hideStatistics,
  timeSeries,
  stats,
  currentResolution,
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
  return (
    <Box
      width="100%"
      pb="8px"
      className="e2e-participation-widget"
      display="flex"
      flexDirection="column"
    >
      {!hideStatistics && stats && (
        <Box display="flex" flexDirection="row" justifyContent="flex-start">
          {show('inputs') && (
            <Box w="25%" pr="12px">
              <Statistic
                nameMessage={messages.inputs}
                {...stats.inputs}
                previousDays={previousDays}
              />
            </Box>
          )}
          {show('comments') && (
            <Box w="25%" pr="12px">
              <Statistic
                nameMessage={messages.comments}
                {...stats.comments}
                previousDays={previousDays}
              />
            </Box>
          )}
          {show('votes') && (
            <Box w="25%" pr="12px">
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
        justifyContent="flex-start"
        mt="28px"
        maxWidth="800px"
        h="240px"
      >
        <Chart
          timeSeries={timeSeries}
          startAtMoment={startAt ? moment(startAt) : null}
          endAtMoment={endAt ? moment(endAt) : null}
          resolution={currentResolution}
          yaxis={{
            orientation: 'right',
            tickFormatter: formatLargeNumber,
          }}
          margin={{ top: 0, right: -16, bottom: 0, left: 0 }}
          participationTypes={participationTypes}
          {...accessibilityProps}
        />
      </Box>
    </Box>
  );
};

export default Wide;
