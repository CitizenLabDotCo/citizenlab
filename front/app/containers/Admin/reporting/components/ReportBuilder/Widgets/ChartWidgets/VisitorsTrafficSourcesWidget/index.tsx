import React from 'react';

import moment from 'moment';

// messages

// settings

import { IResolution } from 'components/admin/ResolutionControl';

import Card from '../../_shared/Card';
import ChartWidgetSettings from '../_shared/ChartWidgetSettings';
import messages from '../messages';
import { ChartWidgetProps } from '../typings';

import VisitorsTrafficSourcesCard from './VisitorTrafficSourcesCard';

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
};

export const visitorsTrafficSourcesTitle = messages.trafficSources;

export default VisitorsTrafficSourcesWidget;
