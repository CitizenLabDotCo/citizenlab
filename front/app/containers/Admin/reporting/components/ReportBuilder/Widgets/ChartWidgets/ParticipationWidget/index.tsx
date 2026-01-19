import React from 'react';

import useLocalize from 'hooks/useLocalize';

import { AccessibilityProps } from 'components/admin/Graphs/typings';

import Card from '../../_shared/Card';
import { DescriptionText } from '../_shared/DescriptionText';

import ChartWidgetSettings from './ChartWidgetSettings';
import messages from './messages';
import ParticipationCard from './ParticipationCard';
import { Props } from './typings';

const ParticipationWidget = ({
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
      <ParticipationCard {...props} {...accessibilityProps} />
      <DescriptionText
        description={description}
        descriptionId={descriptionId}
      />
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
