import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import { DatesStrings } from 'components/admin/GraphCards/typings';
import StatisticBottomLabel from 'components/admin/Graphs/Statistic/StatisticBottomLabel';
import StatisticDelta from 'components/admin/Graphs/Statistic/StatisticDelta';
import StatisticName from 'components/admin/Graphs/Statistic/StatisticName';

import { useIntl, MessageDescriptor } from 'utils/cl-intl';

import chartWidgetMessages from '../../messages';

interface Props extends DatesStrings {
  nameMessage: MessageDescriptor;
  stat: { value: number; delta?: number };
}

export const AbsoluteStatistic = ({
  nameMessage,
  stat,
  startAt,
  endAt,
}: Props) => {
  const { formatMessage } = useIntl();
  const previousDays = moment(endAt).diff(moment(startAt), 'days');

  return (
    <Box>
      <StatisticName name={formatMessage(nameMessage)} nameColor="black" />
      <Box mt="2px">
        <Text color="textPrimary" fontSize="xl" display="inline">
          {stat.value}
        </Text>
        {stat.delta !== undefined && <StatisticDelta delta={stat.delta} />}
      </Box>
      {stat.delta !== undefined && (
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
