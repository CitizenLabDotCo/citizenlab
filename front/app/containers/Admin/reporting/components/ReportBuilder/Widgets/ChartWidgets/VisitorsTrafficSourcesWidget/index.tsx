import React from 'react';

import useLocalize from 'hooks/useLocalize';

import { AccessibilityProps } from 'components/admin/Graphs/typings';

import Card from '../../_shared/Card';
import { DescriptionText } from '../_shared/DescriptionText';
import messages from '../messages';

import Settings from './Settings';
import { Props } from './typings';
import VisitorsTrafficSourcesCard from './VisitorTrafficSourcesCard';

const VisitorsTrafficSourcesWidget = ({
  title,
  ariaLabel,
  description,
  view,
  ...props
}: Props & AccessibilityProps) => {
  const localize = useLocalize();
  const descriptionId = `${React.useId()}-description`;
  const accessibilityProps = {
    ariaLabel: ariaLabel
      ? localize(ariaLabel)
      : title
      ? localize(title)
      : undefined,
    ariaDescribedBy: description ? descriptionId : undefined,
  };
  return (
    <Card
      title={title}
      ariaLabel={ariaLabel}
      description={description}
      pagebreak
    >
      <VisitorsTrafficSourcesCard
        view={view}
        {...props}
        {...accessibilityProps}
      />
      {view === 'chart' && (
        <DescriptionText
          description={description}
          descriptionId={descriptionId}
        />
      )}
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
