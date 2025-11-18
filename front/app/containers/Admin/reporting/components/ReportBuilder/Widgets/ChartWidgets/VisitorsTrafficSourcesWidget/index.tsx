import React from 'react';

import Card from '../../_shared/Card';
import messages from '../messages';

import Settings from './Settings';
import { Props } from './typings';
import VisitorsTrafficSourcesCard from './VisitorTrafficSourcesCard';

const VisitorsTrafficSourcesWidget = ({
  title,
  ariaLabel,
  description,
  ...props
}: Props) => {
  return (
    <Card
      title={title}
      ariaLabel={ariaLabel}
      description={description}
      pagebreak
    >
      <VisitorsTrafficSourcesCard {...props} />
    </Card>
  );
};

VisitorsTrafficSourcesWidget.craft = {
  props: {
    title: {},
    ariaLabel: undefined,
    description: undefined,
    projectId: undefined,
    startAtMoment: undefined,
    endAtMoment: null,
  },
  related: {
    settings: Settings,
  },
};

export const visitorsTrafficSourcesTitle = messages.trafficSources;

export default VisitorsTrafficSourcesWidget;
