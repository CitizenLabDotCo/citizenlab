import React from 'react';

import useLocalize from 'hooks/useLocalize';

import messages from 'components/admin/GraphCards/InternalAdoptionCard/messages';
import { AccessibilityProps } from 'components/admin/Graphs/typings';

import Card from '../../_shared/Card';
import { DescriptionText } from '../_shared/DescriptionText';

import ChartWidgetSettings from './ChartWidgetSettings';
import InternalAdoptionCard from './InternalAdoptionCard';
import { Props } from './typings';

const InternalAdoptionWidget = ({
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
      <InternalAdoptionCard {...props} {...accessibilityProps} />
      <DescriptionText
        description={description}
        descriptionId={descriptionId}
      />
    </Card>
  );
};

InternalAdoptionWidget.craft = {
  props: {
    title: {},
    ariaLabel: undefined,
    description: undefined,
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

export const internalAdoptionTitle = messages.internalAdoption;

export default InternalAdoptionWidget;
