import React from 'react';

// components
import Card from '../../_shared/Card';
import AgeCard from './AgeCard';

// messages
import messages from '../messages';

// settings
import ChartWidgetSettings from '../_shared/ChartWidgetSettings';

// types
import { ChartWidgetProps } from '../typings';

const AgeWidget = ({ title, projectId, startAt, endAt }: ChartWidgetProps) => {
  return (
    <Card title={title} pagebreak>
      <AgeCard projectId={projectId} startAt={startAt} endAt={endAt ?? null} />
    </Card>
  );
};

AgeWidget.craft = {
  props: {
    title: '',
    projectFilter: undefined,
    startAt: undefined,
    endAt: null,
  },
  related: {
    settings: ChartWidgetSettings,
  },
  custom: {
    title: messages.usersByAge,
    noPointerEvents: true,
  },
};

export default AgeWidget;
