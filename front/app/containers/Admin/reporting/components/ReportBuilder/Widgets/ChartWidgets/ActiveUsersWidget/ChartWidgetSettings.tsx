import React from 'react';

import {
  colors,
  stylingConsts,
  Box,
  Text,
  Icon,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import { getComparedTimeRange } from 'components/admin/GraphCards/_utils/query';
import activeUsersMessages from 'components/admin/GraphCards/ActiveUsersCard/messages';

import { useIntl } from 'utils/cl-intl';

import {
  ComparisonToggle,
  HideStatisticsToggle,
} from '../_shared/StatisticToggles';
import TimeSeriesWidgetSettings from '../_shared/TimeSeriesWidgetSettings';

const ChartWidgetSettings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    compareStartAt,
    compareEndAt,
  } = useNode((node) => ({
    compareStartAt: node.data.props.compareStartAt,
    compareEndAt: node.data.props.compareEndAt,
  }));

  const comparePreviousPeriod = !!compareStartAt && !!compareEndAt;

  return (
    <Box>
      <Box
        bgColor={colors.teal100}
        borderRadius={stylingConsts.borderRadius}
        px="12px"
        mt="0px"
        role="alert"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text variant="bodyS" color="textSecondary">
          <Icon
            name="info-outline"
            width="16px"
            height="16px"
            mr="4px"
            fill="textSecondary"
            display="inline"
          />
          {formatMessage(activeUsersMessages.cardTitleTooltipMessage)}
        </Text>
      </Box>
      <TimeSeriesWidgetSettings
        onChangeDateRange={({ startDate, endDate }) => {
          if (startDate && endDate) {
            if (comparePreviousPeriod) {
              const { compare_start_at, compare_end_at } = getComparedTimeRange(
                startDate,
                endDate
              );

              setProp((props) => {
                props.compareStartAt = compare_start_at;
                props.compareEndAt = compare_end_at;
              });
            }
          } else {
            // Make sure that we always reset compared date range
            // if the main date range is not fully set
            setProp((props) => {
              props.compareStartAt = undefined;
              props.compareEndAt = undefined;
            });
          }
        }}
      />
      <ComparisonToggle />
      <HideStatisticsToggle />
    </Box>
  );
};

export default ChartWidgetSettings;
