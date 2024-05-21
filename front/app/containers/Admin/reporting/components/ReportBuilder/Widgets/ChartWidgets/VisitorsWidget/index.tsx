import React from 'react';

import Card from '../../_shared/Card';
import TimeSeriesWidgetSettings from '../_shared/TimeSeriesWidgetSettings';
import messages from '../messages';
import { TimeSeriesWidgetProps } from '../typings';

import VisitorsCard from './VisitorsCard';

const VisitorsWidget = ({ title, ...props }: TimeSeriesWidgetProps) => {
  return (
    <Card title={title} pagebreak>
      <VisitorsCard {...props} />
    </Card>
  );
};

VisitorsWidget.craft = {
  props: {
    title: {},
    projectId: undefined,
    startAt: undefined,
    endAt: undefined,
    resolution: undefined,
  },
  related: {
    settings: TimeSeriesWidgetSettings,
  },
};

export const visitorsTitle = messages.visitorTimeline;

export default VisitorsWidget;
