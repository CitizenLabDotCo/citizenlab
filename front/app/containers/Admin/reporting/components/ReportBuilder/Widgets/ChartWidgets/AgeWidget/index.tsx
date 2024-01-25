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

// utils
import moment from 'moment';

const AgeWidget = ({ title, projectId, startAt, endAt }: ChartWidgetProps) => {
  const props = {
    startAtMoment: startAt ? moment(startAt) : null,
    endAtMoment: endAt ? moment(endAt) : null,
    projectId,
  };

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
  custom: {
    title: messages.usersByAge,
    noPointerEvents: true,
  },
};

export default AgeWidget;
