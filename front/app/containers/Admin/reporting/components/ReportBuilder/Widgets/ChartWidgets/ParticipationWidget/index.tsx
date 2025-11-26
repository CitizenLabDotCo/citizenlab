import React from 'react';

import { AccessibilityProps } from 'components/admin/Graphs/typings';

import Card from '../../_shared/Card';

import ChartWidgetSettings from './ChartWidgetSettings';
import messages from './messages';
import ParticipationCard from './ParticipationCard';
import { Props } from './typings';

const ParticipationWidget = ({
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
      <ParticipationCard {...props} {...accessibilityProps} />
    </Card>
  );
};

ParticipationWidget.craft = {
  props: {
    title: {},
    ariaLabel: undefined,
    description: undefined,
    projectId: undefined,
    startAt: undefined,
    endAt: null,
    resolution: undefined,
    compareStartAt: undefined,
    compareEndAt: undefined,
    hideStatistics: undefined,
    participationTypes: {
      inputs: true,
      comments: true,
      votes: true,
    },
  },
  related: {
    settings: ChartWidgetSettings,
  },
};

export const participationTitle = messages.participation;

export default ParticipationWidget;
