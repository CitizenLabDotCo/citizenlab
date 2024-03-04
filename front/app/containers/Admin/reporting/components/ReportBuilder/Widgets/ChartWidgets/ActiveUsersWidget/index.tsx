import React from 'react';

import moment from 'moment';

import { IResolution } from 'components/admin/ResolutionControl';

import Card from '../../_shared/Card';
import messages from '../messages';
import { ChartWidgetProps } from '../typings';

import ActiveUsers from './ActiveUsersCard';
import ChartWidgetSettings from './ChartWidgetSettings';

// settings

const ActiveUsersWidget = ({
  title,
  projectId,
  startAt,
  endAt,
}: ChartWidgetProps) => {
  const resolution: IResolution = 'month';

  const analyticsChartProps = {
    startAtMoment: startAt ? moment(startAt) : null,
    endAtMoment: endAt ? moment(endAt) : null,
    projectId,
    resolution,
  };

  return (
    <Card title={title} pagebreak>
      <ActiveUsers {...analyticsChartProps} />
    </Card>
  );
};

ActiveUsersWidget.craft = {
  props: {
    title: {},
    projectId: undefined,
    startAtMoment: undefined,
    endAtMoment: null,
  },
  related: {
    settings: ChartWidgetSettings,
  },
};

export const activeUsersTitle = messages.activeUsersTimeline;

export default ActiveUsersWidget;
