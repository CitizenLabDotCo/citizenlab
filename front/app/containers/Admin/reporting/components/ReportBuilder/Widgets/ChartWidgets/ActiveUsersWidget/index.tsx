import React from 'react';

import Card from '../../_shared/Card';
import messages from '../messages';

import ActiveUsers from './ActiveUsersCard';
import ChartWidgetSettings from './ChartWidgetSettings';
import { Props } from './typings';

const ActiveUsersWidget = ({ title, ...props }: Props) => {
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
    hideStatistics: undefined,
  },
  related: {
    settings: ChartWidgetSettings,
  },
};

export const activeUsersTitle = messages.activeUsersTimeline;

export default ActiveUsersWidget;
