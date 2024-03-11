import React from 'react';

import Card from '../../_shared/Card';
import ChartWidgetSettings from '../_shared/ChartWidgetSettings';
import messages from '../messages';
import { ChartWidgetProps } from '../typings';

import VisitorsCard from './VisitorsCard';

const VisitorsWidget = ({ title, ...props }: ChartWidgetProps) => {
  return (
    <Card title={title} pagebreak>
      <VisitorsCard {...props} resolution="month" />
    </Card>
  );
};

VisitorsWidget.craft = {
  props: {
    title: {},
    projectId: undefined,
    startAt: undefined,
    endAt: undefined,
  },
  related: {
    settings: ChartWidgetSettings,
  },
};

export const visitorsTitle = messages.visitorTimeline;

export default VisitorsWidget;
