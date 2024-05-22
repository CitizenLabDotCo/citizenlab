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

const getParticipationTypes = ({
  inputs,
  comments,
  votes,
}: {
  inputs: boolean;
  comments: boolean;
  votes: boolean;
}) => {
  const participationTypes: ParticipationType[] = [];

  if (inputs) participationTypes.push('inputs');
  if (comments) participationTypes.push('comments');
  if (votes) participationTypes.push('votes');

  return participationTypes;
};

const ChartWidgetSettings = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    participationTypes,
  } = useNode((node) => ({
    participationTypes: node.data.props
      .participationTypes as ParticipationType[],
  }));

  const inputsVisible = participationTypes.includes('inputs');
  const commentsVisible = participationTypes.includes('comments');
  const votesVisible = participationTypes.includes('votes');

  return (
    <Box>
      <TimeSeriesWidgetSettings
        onChangeDateRange={({ startDate, endDate }) => {
          if (!startDate || !endDate) {
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
          checked={inputsVisible}
          onChange={() => {
            setProp((props) => {
              props.participationTypes = getParticipationTypes({
                inputs: !inputsVisible,
                comments: commentsVisible,
                votes: votesVisible,
              });
            });
          }}
          label={formatMessage(messages.showInputs)}
          marginBottom="12px"
        />
        <Checkbox
          checked={commentsVisible}
          onChange={() => {
            setProp((props) => {
              props.participationTypes = getParticipationTypes({
                inputs: inputsVisible,
                comments: !commentsVisible,
                votes: votesVisible,
              });
            });
          }}
          label={formatMessage(messages.showComments)}
          marginBottom="12px"
        />
        <Checkbox
          checked={votesVisible}
          onChange={() => {
            setProp((props) => {
              props.participationTypes = getParticipationTypes({
                inputs: inputsVisible,
                comments: commentsVisible,
                votes: !votesVisible,
              });
            });
          }}
          label={formatMessage(messages.showVotes)}
        />
      </Box>
    </Box>
  );
};

export default ChartWidgetSettings;
