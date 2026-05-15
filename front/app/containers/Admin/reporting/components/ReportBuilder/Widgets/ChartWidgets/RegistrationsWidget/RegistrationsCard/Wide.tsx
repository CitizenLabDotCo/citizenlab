import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import Chart from 'components/admin/GraphCards/RegistrationsCard/Chart';
import { TimeSeries } from 'components/admin/GraphCards/RegistrationsCard/useRegistrations/typings';
import { DatesStrings } from 'components/admin/GraphCards/typings';
import { AccessibilityProps } from 'components/admin/Graphs/typings';
import { IResolution } from 'components/admin/ResolutionControl';

import { useIntl } from 'utils/cl-intl';

import A11yTable from '../../_shared/A11yTable';
import { getDaysInRange } from '../../utils';
import messages from '../messages';
import { Stats } from '../typings';

import {
  RegistrationRateStatistic,
  RegistrationsStatistic,
} from './Statistics';

export interface Props extends DatesStrings {
  timeSeries: TimeSeries | null;
  hideStatistics: boolean;
  stats: Stats;
  currentResolution: IResolution;
}

const Wide = ({
  startAt,
  endAt,
  timeSeries,
  hideStatistics,
  stats,
  currentResolution,
  ariaLabel,
  ariaDescribedBy,
}: Props & AccessibilityProps) => {
  const previousDays = getDaysInRange(startAt, endAt);
  const accessibilityProps = {
    ariaLabel,
    ariaDescribedBy,
  };
  const { formatMessage } = useIntl();
  return (
    <Box width="100%" pb="8px" display="flex" flexDirection="column">
      <Box
        width="100%"
        height="260px"
        className="e2e-registrations-timeline-widget"
        display="flex"
        flexDirection="row"
      >
        {!hideStatistics && (
          <Box>
            <RegistrationsStatistic stats={stats} previousDays={previousDays} />
            <Box mt="32px">
              <RegistrationRateStatistic
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
          mt="8x"
          maxWidth="800px"
          h="100%"
        >
          <Chart
            timeSeries={timeSeries}
            startAtMoment={startAt ? moment(startAt) : null}
            endAtMoment={endAt ? moment(endAt) : null}
            resolution={currentResolution}
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
        columns={[
          {
            key: 'date',
            label: formatMessage(messages.dateColumn),
            render: (value) => moment(value).format('MMM DD, YYYY'),
          },
          {
            key: 'registrations',
            label: formatMessage(messages.registrationsColumn),
          },
        ]}
        data={timeSeries || []}
        caption={formatMessage(messages.registrationCaption)}
      />
    </Box>
  );
};

export default Wide;
