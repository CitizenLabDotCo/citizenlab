import React from 'react';

import Card from '../../_shared/Card';
import ChartWidgetSettings from '../_shared/ChartWidgetSettings';
import messages from '../messages';
import { ChartWidgetProps } from '../typings';

import AgeCard from './AgeCard';

const AgeWidget = ({ title, ...props }: ChartWidgetProps) => {
  return (
    <Card title={title} pagebreak>
      <AgeCard {...props} />
    </Card>
  );
};

AgeWidget.craft = {
  props: {
    title: {},
    projectId: undefined,
    startAt: undefined,
    endAt: null,
  },
  related: {
    settings: ChartWidgetSettings,
  },
};

export const ageTitle = messages.usersByAge;

export default AgeWidget;
