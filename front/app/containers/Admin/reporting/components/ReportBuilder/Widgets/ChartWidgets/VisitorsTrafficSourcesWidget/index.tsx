import React from 'react';

import { AccessibilityProps } from 'components/admin/Graphs/typings';

import Card from '../../_shared/Card';
import messages from '../messages';

import Settings from './Settings';
import { Props } from './typings';
import VisitorsTrafficSourcesCard from './VisitorTrafficSourcesCard';

const VisitorsTrafficSourcesWidget = ({
  title,
  ariaLabel,
  description,
  ariaDescribedBy,
  ...props
}: Props & AccessibilityProps) => {
  const accessibilityProps = {
    ariaLabel,
    ariaDescribedBy,
  };
  return (
    <Card
      title={title}
      ariaLabel={ariaLabel}
      description={description}
      pagebreak
    >
      <VisitorsTrafficSourcesCard {...props} {...accessibilityProps} />
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
