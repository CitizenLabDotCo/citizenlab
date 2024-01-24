import React from 'react';

// components
import Card from '../../_shared/Card';
import VisitorsTrafficSourcesCard from './VisitorTrafficSourcesCard';

// utils
import moment from 'moment';

// messages
import messages from '../messages';

// settings
import ChartWidgetSettings from '../_shared/ChartWidgetSettings';

// types
import { IResolution } from 'components/admin/ResolutionControl';
import { ChartWidgetProps } from '../typings';

const VisitorsTrafficSourcesWidget = ({
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
      <VisitorsTrafficSourcesCard {...analyticsChartProps} />
    </Card>
  );
};

VisitorsTrafficSourcesWidget.craft = {
  props: {
    title: {},
    projectId: undefined,
    startAtMoment: undefined,
    endAtMoment: null,
  },
  related: {
    settings: ChartWidgetSettings,
  },
  custom: {
    noPointerEvents: true,
  },
};

export const visitorsTrafficSourcesTitle = messages.trafficSources;

export default VisitorsTrafficSourcesWidget;
