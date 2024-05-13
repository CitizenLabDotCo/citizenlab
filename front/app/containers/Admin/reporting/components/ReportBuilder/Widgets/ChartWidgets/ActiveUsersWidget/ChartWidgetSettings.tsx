import React from 'react';

import {
  colors,
  stylingConsts,
  Box,
  Text,
  Icon,
  Toggle,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import Tippy from '@tippyjs/react';

import { getComparedTimeRange } from 'components/admin/GraphCards/_utils/query';
import activeUsersMessages from 'components/admin/GraphCards/ActiveUsersCard/messages';

import { useIntl } from 'utils/cl-intl';

import TimeSeriesWidgetSettings from '../_shared/TimeSeriesWidgetSettings';

import messages from './messages';

const ChartWidgetSettings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    startAt,
    endAt,
    compareStartAt,
    compareEndAt,
    hideStatistics,
  } = useNode((node) => ({
    startAt: node.data.props.startAt,
    endAt: node.data.props.endAt,
    compareStartAt: node.data.props.compareStartAt,
    compareEndAt: node.data.props.compareEndAt,
    hideStatistics: node.data.props.hideStatistics,
  }));

  const noTimePeriodSelected = !startAt || !endAt;
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
      <TimeSeriesWidgetSettings />
      <Box mb="20px">
        <Tippy
          content={formatMessage(messages.youNeedToSelectADateRange)}
          disabled={!noTimePeriodSelected}
          placement="left-start"
          zIndex={999999}
        >
          <div>
            <Toggle
              id="e2e-compare-previous-period-toggle"
              label={formatMessage(messages.showComparisonLastPeriod)}
              disabled={noTimePeriodSelected}
              checked={comparePreviousPeriod}
              onChange={() => {
                setProp((props) => {
                  if (noTimePeriodSelected || comparePreviousPeriod) {
                    props.compareStartAt = undefined;
                    props.compareEndAt = undefined;
                    return;
                  }

                  const { compare_start_at, compare_end_at } =
                    getComparedTimeRange(startAt, endAt);
                  props.compareStartAt = compare_start_at;
                  props.compareEndAt = compare_end_at;
                });
              }}
            />
          </div>
        </Tippy>
      </Box>
      <Box mb="20px">
        <Toggle
          label={'TODO'}
          checked={hideStatistics}
          onChange={() => {
            setProp((props) => {
              props.hideStatistics = !hideStatistics;
            });
          }}
        />
      </Box>
    </Box>
  );
};

export default ChartWidgetSettings;
