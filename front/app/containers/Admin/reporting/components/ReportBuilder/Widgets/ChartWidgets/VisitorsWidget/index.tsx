import React from 'react';

import Card from '../../_shared/Card';
import messages from '../messages';

import ChartWidgetSettings from './ChartWidgetSettings';
import { Props } from './typings';
import VisitorsCard from './VisitorsCard';

const VisitorsWidget = ({ title, ...props }: Props) => {
  return (
    <Card title={title} pagebreak>
      <VisitorsCard {...props} />
    </Card>
  );
};

VisitorsWidget.craft = {
  props: {
    title: {},
    startAt: undefined,
    endAt: undefined,
    resolution: undefined,
    compareStartAt: undefined,
    compareEndAt: undefined,
    hideStatistics: undefined,
  },
  related: {
    settings: ChartWidgetSettings,
  },
};

export const visitorsTitle = messages.visitorTimeline;

export default VisitorsWidget;
