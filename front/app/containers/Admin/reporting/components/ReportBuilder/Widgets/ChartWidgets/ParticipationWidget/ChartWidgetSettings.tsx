import React from 'react';

import { Box, Checkbox } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import { ParticipationType } from 'api/graph_data_units/requestTypes';

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
  } = useNode((node) => ({
    participationTypes: node.data.props.participationTypes as Record<
      ParticipationType,
      boolean
    >,
  }));

  const { inputs, comments, votes } = participationTypes;

  return (
    <Box>
      <TimeSeriesWidgetSettings resetComparePeriod />
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
