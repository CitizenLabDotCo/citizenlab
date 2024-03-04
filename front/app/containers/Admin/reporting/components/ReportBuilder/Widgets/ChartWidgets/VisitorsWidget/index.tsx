import React from 'react';

import Card from '../../_shared/Card';
import VisitorsCard from './VisitorsCard';

import moment from 'moment';

// settings
import messages from '../messages';
import ChartWidgetSettings from '../_shared/ChartWidgetSettings';

import { IResolution } from 'components/admin/ResolutionControl';
import { ChartWidgetProps } from '../typings';

const VisitorsWidget = ({
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
    title,
  };

  return (
    <Card title={title} pagebreak>
      <VisitorsCard {...analyticsChartProps} />
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
