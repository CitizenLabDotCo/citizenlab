import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import { DatesStrings } from 'components/admin/GraphCards/typings';
import StatisticBottomLabel from 'components/admin/Graphs/Statistic/StatisticBottomLabel';
import StatisticDelta, {
  getSignNumber,
} from 'components/admin/Graphs/Statistic/StatisticDelta';
import StatisticName from 'components/admin/Graphs/Statistic/StatisticName';

import { useIntl, MessageDescriptor } from 'utils/cl-intl';

import chartWidgetMessages from '../../messages';

interface PropsAbsolute extends DatesStrings {
  nameMessage: MessageDescriptor;
  stat: { value: number; delta?: number };
}

export const AbsoluteStatistic = ({
  nameMessage,
  stat,
  startAt,
  endAt,
}: PropsAbsolute) => {
  const { formatMessage } = useIntl();
  const previousDays = moment(endAt).diff(moment(startAt), 'days');

  return (
    <Box>
      <StatisticName name={formatMessage(nameMessage)} nameColor="black" />
      <Box mt="2px">
        <Text color="textPrimary" fontSize="xl" display="inline">
          {stat.value}
        </Text>
        {stat.delta !== undefined && (
          <StatisticDelta delta={stat.delta} sign={getSignNumber(stat.delta)} />
        )}
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

interface PropsDuration extends DatesStrings {
  nameMessage: MessageDescriptor;
  stat: { value: string; delta?: string };
}

const getDurationDeltaSign = (delta: string) => {
  if (delta.startsWith('-')) return 'negative';
  if (delta === '00:00:00') return 'zero';
  return 'positive';
};

export const VisitDurationStatistic = ({
  nameMessage,
  stat,
  startAt,
  endAt,
}: PropsDuration) => {
  const { formatMessage } = useIntl();
  const previousDays = moment(endAt).diff(moment(startAt), 'days');

  return (
    <Box>
      <StatisticName name={formatMessage(nameMessage)} nameColor="black" />
      <Box mt="2px">
        <Text color="textPrimary" fontSize="xl" display="inline">
          {stat.value}
        </Text>
        {stat.delta !== undefined && (
          <StatisticDelta
            delta={stat.delta}
            sign={getDurationDeltaSign(stat.delta)}
          />
        )}
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

const getPageViewsDeltaSign = (delta: string) => {
  if (delta.startsWith('-')) return 'negative';
  if (delta === '0') return 'zero';
  return 'positive';
};

export const PageViewsStatistic = ({
  nameMessage,
  stat,
  startAt,
  endAt,
}: PropsDuration) => {
  const { formatMessage } = useIntl();
  const previousDays = moment(endAt).diff(moment(startAt), 'days');

  return (
    <Box>
      <StatisticName name={formatMessage(nameMessage)} nameColor="black" />
      <Box mt="2px">
        <Text color="textPrimary" fontSize="xl" display="inline">
          {stat.value}
        </Text>
        {stat.delta !== undefined && (
          <StatisticDelta
            delta={stat.delta}
            sign={getPageViewsDeltaSign(stat.delta)}
          />
        )}
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
