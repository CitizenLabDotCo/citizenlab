import React from 'react';

import Card from '../../_shared/Card';
import ChartWidgetSettings from '../_shared/ChartWidgetSettings';
import messages from '../messages';
import { ChartWidgetProps } from '../typings';

import VisitorsTrafficSourcesCard from './VisitorTrafficSourcesCard';

const VisitorsTrafficSourcesWidget = ({
  title,
  ...props
}: ChartWidgetProps) => {
  return (
    <Card title={title} pagebreak>
      <VisitorsTrafficSourcesCard {...props} />
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
