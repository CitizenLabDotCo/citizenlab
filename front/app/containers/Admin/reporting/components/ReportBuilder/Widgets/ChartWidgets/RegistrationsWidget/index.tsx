import React from 'react';

import useLocalize from 'hooks/useLocalize';

import { AccessibilityProps } from 'components/admin/Graphs/typings';

import Card from '../../_shared/Card';
import { DescriptionText } from '../_shared/DescriptionText';

import ChartWidgetSettings from './ChartWidgetSettings';
import messages from './messages';
import RegistrationsCard from './RegistrationsCard';
import { Props } from './typings';

const RegistrationsWidget = ({
  title,
  description,
  ariaLabel,
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
      description={description}
      pagebreak
      ariaLabel={ariaLabel}
    >
      <RegistrationsCard {...props} {...accessibilityProps} />
      <DescriptionText
        description={description}
        descriptionId={descriptionId}
      />
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
