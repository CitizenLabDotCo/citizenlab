import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import Chart from 'components/admin/GraphCards/RegistrationsCard/Chart';
import { AccessibilityProps } from 'components/admin/Graphs/typings';

import { useIntl } from 'utils/cl-intl';

import A11yTable, { Column } from '../../_shared/A11yTable';
import { getDaysInRange } from '../../utils';
import messages from '../messages';

import {
  RegistrationsStatistic,
  RegistrationRateStatistic,
} from './Statistics';
import { Props } from './Wide';

const Narrow = ({
  startAt,
  endAt,
  hideStatistics,
  timeSeries,
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

  const columns: Column[] = [
    {
      key: 'date',
      label: formatMessage(messages.dateColumn),
      type: 'date',
    },
    {
      key: 'registrations',
      label: formatMessage(messages.registrationsColumn),
    },
  ];

  return (
    <Box
      width="100%"
      pb="8px"
      className="e2e-registrations-timeline-widget"
      display="flex"
      flexDirection="column"
    >
      {!hideStatistics && (
        <Box mb="8px">
          <RegistrationsStatistic stats={stats} previousDays={previousDays} />
          <Box mt="12px">
            <RegistrationRateStatistic
              stats={stats}
              previousDays={previousDays}
            />
          </Box>
        </Box>
      )}

      <Box display="flex" height="200px" w="100%" mt="8px">
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
          yaxis={{ orientation: 'right' }}
          {...accessibilityProps}
        />
      </Box>

      <A11yTable
        columns={columns}
        data={timeSeries || []}
        caption={formatMessage(messages.registrationCaption)}
      />
    </Box>
  );
};

export default Narrow;
