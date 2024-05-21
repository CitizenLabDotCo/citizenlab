import React from 'react';

import Card from '../../_shared/Card';

import ChartWidgetSettings from './ChartWidgetSettings';
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
    startAt: undefined,
    endAt: undefined,
  },
  related: {
    settings: ChartWidgetSettings,
  },
};

export default MethodsUsedWidget;
