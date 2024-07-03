import React from 'react';

import { Box, Toggle, Tooltip } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import { getComparedTimeRange } from 'components/admin/GraphCards/_utils/query';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

export const ComparisonToggle = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    startAt,
    endAt,
    compareStartAt,
    compareEndAt,
  } = useNode((node) => ({
    startAt: node.data.props.startAt,
    endAt: node.data.props.endAt,
    compareStartAt: node.data.props.compareStartAt,
    compareEndAt: node.data.props.compareEndAt,
  }));

  const noTimePeriodSelected = !startAt || !endAt;
  const comparePreviousPeriod = !!compareStartAt && !!compareEndAt;

  return (
    <Box mb="20px">
      <Tooltip
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
      </Tooltip>
    </Box>
  );
};

export const HideStatisticsToggle = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    hideStatistics,
  } = useNode((node) => ({
    hideStatistics: node.data.props.hideStatistics,
  }));

  return (
    <Box mb="20px">
      <Toggle
        label={formatMessage(messages.hideStatistics)}
        checked={!!hideStatistics}
        onChange={() => {
          setProp((props) => {
            props.hideStatistics = !hideStatistics;
          });
        }}
      />
    </Box>
  );
};
