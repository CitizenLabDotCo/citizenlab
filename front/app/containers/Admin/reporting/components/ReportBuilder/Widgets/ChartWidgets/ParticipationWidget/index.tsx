import React from 'react';

import Card from '../../_shared/Card';

import ChartWidgetSettings from './ChartWidgetSettings';
import messages from './messages';
import ParticipationCard from './ParticipationCard';
import { Props } from './typings';

const ParticipationWidget = ({ title, ...props }: Props) => {
  return (
    <Card title={title} pagebreak>
      <ParticipationCard {...props} />
    </Card>
  );
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
    participationTypes: {
      inputs: true,
      comments: true,
      votes: true,
    },
  },
  related: {
    settings: ChartWidgetSettings,
  },
};

export const participationTitle = messages.participation;

export default ParticipationWidget;
