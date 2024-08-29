import React from 'react';

import Card from '../../_shared/Card';
import messages from '../messages';

import ChartWidgetSettings from './ChartWidgetSettings';
import ParticipantsCard from './ParticipantsCard';
import { Props } from './typings';

const ParticipantsWidget = ({ title, ...props }: Props) => {
  return (
    <Card title={title} pagebreak>
      <ParticipantsCard {...props} />
    </Card>
  );
};

ParticipantsWidget.craft = {
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

export const participantsTitle = messages.participantsTimeline;

export default ParticipantsWidget;
