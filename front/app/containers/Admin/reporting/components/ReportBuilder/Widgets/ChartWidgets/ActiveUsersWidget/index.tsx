import React from 'react';

import Card from '../../_shared/Card';
import messages from '../messages';
import { TimeSeriesWidgetProps } from '../typings';

import ActiveUsers from './ActiveUsersCard';
import ChartWidgetSettings from './ChartWidgetSettings';

const ActiveUsersWidget = ({ title, ...props }: TimeSeriesWidgetProps) => {
  return (
    <Card title={title} pagebreak>
      <ActiveUsers {...props} />
    </Card>
  );
};

ActiveUsersWidget.craft = {
  props: {
    title: {},
    projectId: undefined,
    startAt: undefined,
    endAt: null,
    resolution: undefined,
    compareStartAt: undefined,
    compareEndAt: undefined,
  },
  related: {
    settings: ChartWidgetSettings,
  },
};

export const activeUsersTitle = messages.activeUsersTimeline;

export default ActiveUsersWidget;
