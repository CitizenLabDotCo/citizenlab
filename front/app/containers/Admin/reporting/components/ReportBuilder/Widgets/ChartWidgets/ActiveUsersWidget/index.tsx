import React from 'react';

import Card from '../../_shared/Card';
import TimeSeriesWidgetSettings from '../_shared/TimeSeriesWidgetSettings';
import messages from '../messages';
import { TimeSeriesWidgetProps } from '../typings';

import ActiveUsers from './ActiveUsersCard';

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
  },
  related: {
    settings: TimeSeriesWidgetSettings,
  },
};

export const activeUsersTitle = messages.activeUsersTimeline;

export default ActiveUsersWidget;
