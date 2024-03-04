import React from 'react';

import moment from 'moment';

import Card from '../../_shared/Card';
import ChartWidgetSettings from '../_shared/ChartWidgetSettings';
import messages from '../messages';
import { ChartWidgetProps } from '../typings';

import GenderCard from './GenderCard';

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
