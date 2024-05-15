import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import { DatesStrings } from 'components/admin/GraphCards/typings';
import StatisticBottomLabel from 'components/admin/Graphs/Statistic/StatisticBottomLabel';
import StatisticDelta from 'components/admin/Graphs/Statistic/StatisticDelta';
import StatisticName from 'components/admin/Graphs/Statistic/StatisticName';

import { useIntl } from 'utils/cl-intl';

import chartWidgetMessages from '../../messages';
import { Stats } from '../typings';

interface Props extends DatesStrings {
  stats: Stats;
}

export const RegistrationsStatistic = ({ stats, startAt, endAt }: Props) => {
  const { formatMessage } = useIntl();
  const previousDays = moment(endAt).diff(moment(startAt), 'days');

  return (
    <Box>
      <StatisticName
        name={formatMessage(chartWidgetMessages.registrations)}
        nameColor="black"
      />
      <Box mt="2px">
        <Text color="textPrimary" fontSize="xl" display="inline">
          {stats.registrations.value}
        </Text>
        {stats.registrations.delta !== undefined && (
          <StatisticDelta delta={stats.registrations.delta} />
        )}
      </Box>
      {stats.registrations.delta !== undefined && (
        <StatisticBottomLabel
          bottomLabel={formatMessage(
            chartWidgetMessages.comparedToPreviousXDays,
            {
              days: previousDays,
            }
          )}
        />
      )}
    </Box>
  );
};

export const RegistrationRateStatistic = (_: Props) => {
  return <></>;
};
