import React from 'react';

// components
import Card from '../../_shared/Card';
import GenderCard from './GenderCard';

// messages
import messages from '../messages';

// settings
import ChartWidgetSettings from '../_shared/ChartWidgetSettings';

// types
import { ChartWidgetProps } from '../typings';

const GenderWidget = ({
  title,
  projectId,
  startAt,
  endAt,
}: ChartWidgetProps) => {
  return (
    <Card title={title} pagebreak>
      <GenderCard
        projectId={projectId}
        startAt={startAt}
        endAt={endAt ?? null}
      />
    </Card>
  );
};

GenderWidget.craft = {
  props: {
    title: {},
    projectId: undefined,
    startAt: undefined,
    endAt: null,
  },
  related: {
    settings: ChartWidgetSettings,
  },
  custom: {
    title: messages.usersByGender,
    noPointerEvents: true,
  },
};

export default GenderWidget;
