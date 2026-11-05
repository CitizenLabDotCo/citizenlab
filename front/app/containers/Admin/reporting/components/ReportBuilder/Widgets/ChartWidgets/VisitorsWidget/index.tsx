import React from 'react';

import useLocalize from 'hooks/useLocalize';

import { AccessibilityProps } from 'components/admin/Graphs/typings';

import Card from '../../_shared/Card';
import { DescriptionText } from '../_shared/DescriptionText';
import messages from '../messages';

import ChartWidgetSettings from './ChartWidgetSettings';
import { Props } from './typings';
import VisitorsCard from './VisitorsCard';

const VisitorsWidget = ({
  title,
  ariaLabel,
  description,
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
      <VisitorsCard {...accessibilityProps} {...props} />
      <DescriptionText
        description={description}
        descriptionId={descriptionId}
      />
    </Card>
  );
};

VisitorsWidget.craft = {
  props: {
    title: {},
    ariaLabel: undefined,
    description: undefined,
    startAt: undefined,
    endAt: undefined,
    projectId: undefined,
    resolution: undefined,
    compareStartAt: undefined,
    compareEndAt: undefined,
    hideStatistics: undefined,
  },
  related: {
    settings: ChartWidgetSettings,
  },
};

export const visitorsTitle = messages.visitorTimeline;

export default VisitorsWidget;
