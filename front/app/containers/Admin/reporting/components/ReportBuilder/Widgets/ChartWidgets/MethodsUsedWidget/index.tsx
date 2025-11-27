import React from 'react';

import useLocalize from 'hooks/__mocks__/useLocalize';

import Card from '../../_shared/Card';
import { DescriptionText } from '../_shared/DescriptionText';

import ChartWidgetSettings from './ChartWidgetSettings';
import messages from './messages';
import MethodsUsedCard from './MethodsUsedCard';
import { Props } from './typings';

const MethodsUsedWidget = ({
  title,
  ariaLabel,
  description,
  ...props
}: Props) => {
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
      <MethodsUsedCard {...props} {...accessibilityProps} />
      <DescriptionText
        description={description}
        descriptionId={descriptionId}
      />
    </Card>
  );
};

MethodsUsedWidget.craft = {
  props: {
    title: {},
    ariaLabel: undefined,
    description: undefined,
    startAt: undefined,
    endAt: undefined,
    compareStartAt: undefined,
    compareEndAt: undefined,
  },
  related: {
    settings: ChartWidgetSettings,
  },
};

export const methodsUsedTitle = messages.methodsUsed;

export default MethodsUsedWidget;
