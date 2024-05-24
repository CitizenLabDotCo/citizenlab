import React from 'react';

import { Box, Checkbox } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import { ParticipationType } from 'api/graph_data_units/requestTypes';

import { getComparedTimeRange } from 'components/admin/GraphCards/_utils/query';

import { useIntl } from 'utils/cl-intl';

import {
  ComparisonToggle,
  HideStatisticsToggle,
} from '../_shared/StatisticToggles';
import TimeSeriesWidgetSettings from '../_shared/TimeSeriesWidgetSettings';

import messages from './messages';

const ChartWidgetSettings = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    participationTypes,
    compareStartAt,
    compareEndAt,
  } = useNode((node) => ({
    participationTypes: node.data.props.participationTypes as Record<
      ParticipationType,
      boolean
    >,
    compareStartAt: node.data.props.compareStartAt,
    compareEndAt: node.data.props.compareEndAt,
  }));

  const { inputs, comments, votes } = participationTypes;
  const comparePreviousPeriod = !!compareStartAt && !!compareEndAt;

  return (
    <Box>
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
      <Box mb="20px">
        <Checkbox
          checked={inputs}
          onChange={() => {
            setProp((props) => {
              props.participationTypes = {
                inputs: !inputs,
                comments,
                votes,
              };
            });
          }}
          label={formatMessage(messages.showInputs)}
          marginBottom="12px"
        />
        <Checkbox
          checked={comments}
          onChange={() => {
            setProp((props) => {
              props.participationTypes = {
                inputs,
                comments: !comments,
                votes,
              };
            });
          }}
          label={formatMessage(messages.showComments)}
          marginBottom="12px"
        />
        <Checkbox
          checked={votes}
          onChange={() => {
            setProp((props) => {
              props.participationTypes = {
                inputs,
                comments,
                votes: !votes,
              };
            });
          }}
          label={formatMessage(messages.showVotes)}
        />
      </Box>
    </Box>
  );
};

export default ChartWidgetSettings;
