import React from 'react';

import { AccessibilityProps } from 'components/admin/Graphs/typings';

import Card from '../../_shared/Card';

import ChartWidgetSettings from './ChartWidgetSettings';
import messages from './messages';
import RegistrationsCard from './RegistrationsCard';
import { Props } from './typings';

const RegistrationsWidget = ({
  title,
  description,
  ariaLabel,
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
      description={description}
      pagebreak
      ariaLabel={ariaLabel}
    >
      <RegistrationsCard {...props} {...accessibilityProps} />
    </Card>
  );
};

RegistrationsWidget.craft = {
  props: {
    title: {},
    description: undefined,
    ariaLabel: undefined,
    startAt: undefined,
    endAt: null,
    resolution: undefined,
    compareStartAt: undefined,
    compareEndAt: undefined,
    hideStatistics: undefined,
  },
  related: {
    settings: ChartWidgetSettings,
  },
};

export const registrationsTitle = messages.registrationsTimeline;

export default RegistrationsWidget;
