import React from 'react';

import Card from '../../_shared/Card';

import ChartWidgetSettings from './ChartWidgetSettings';
import messages from './messages';
import MethodsUsedCard from './MethodsUsedCard';
import { Props } from './typings';

const MethodsUsedWidget = ({ title, ...props }: Props) => {
  return (
    <Card title={title} pagebreak>
      <MethodsUsedCard {...props} />
    </Card>
  );
};

MethodsUsedWidget.craft = {
  props: {
    title: {},
    startAt: undefined,
    endAt: undefined,
    compareStartAt: undefined,
    compareEndAt: undefined,
    projectPublicationStatus: undefined,
  },
  related: {
    settings: ChartWidgetSettings,
  },
};

export const methodsUsedTitle = messages.methodsUsed;

export default MethodsUsedWidget;
