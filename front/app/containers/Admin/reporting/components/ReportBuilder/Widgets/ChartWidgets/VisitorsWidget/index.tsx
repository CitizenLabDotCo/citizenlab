import React from 'react';

// components
import Card from '../../_shared/Card';
import VisitorsCard from './VisitorsCard';

// utils
import moment from 'moment';

// settings
import messages from '../messages';
import ChartWidgetSettings from '../_shared/ChartWidgetSettings';

// types
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
  custom: {
    noPointerEvents: true,
  },
};

export const visitorsTitle = messages.visitorTimeline;

export default VisitorsWidget;
