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

// utils
import moment from 'moment';

const GenderWidget = ({
  title,
  projectId,
  startAt,
  endAt,
}: ChartWidgetProps) => {
  const props = {
    startAtMoment: startAt ? moment(startAt) : null,
    endAtMoment: endAt ? moment(endAt) : null,
    projectId,
  };

  return (
    <Card title={title} pagebreak>
      <GenderCard {...props} />
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
};

export const genderTitle = messages.usersByGender;

export default GenderWidget;
