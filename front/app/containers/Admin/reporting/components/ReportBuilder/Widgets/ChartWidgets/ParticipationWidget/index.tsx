import React from 'react';

import ChartWidgetSettings from './ChartWidgetSettings';
import messages from './messages';
import { Props } from './typings';

const ParticipationWidget = (_props: Props) => {
  return <></>;
};

ParticipationWidget.craft = {
  props: {
    title: {},
    projectId: undefined,
    startAt: undefined,
    endAt: null,
    resolution: undefined,
    compareStartAt: undefined,
    compareEndAt: undefined,
    hideStatistics: undefined,
  },
  related: {
    settings: ChartWidgetSettings,
  },
};

export const participationTitle = messages.participation;

export default ParticipationWidget;
