import React from 'react';

import Card from '../../_shared/Card';
import messages from '../messages';
import { ChartWidgetProps } from '../typings';

import ActiveUsers from './ActiveUsersCard';
import ChartWidgetSettings from './ChartWidgetSettings';

const ActiveUsersWidget = ({ title, ...props }: ChartWidgetProps) => {
  return (
    <Card title={title} pagebreak>
      <ActiveUsers {...props} resolution="month" />
    </Card>
  );
};

ActiveUsersWidget.craft = {
  props: {
    title: {},
    projectId: undefined,
    startAt: undefined,
    endAt: null,
    comparePreviousPeriod: undefined,
  },
  related: {
    settings: ChartWidgetSettings,
  },
};

export const activeUsersTitle = messages.activeUsersTimeline;

export default ActiveUsersWidget;
