import React from 'react';

import Card from '../../../_shared/Card';
import ChartWidgetSettings from '../../_shared/ChartWidgetSettings';
import messages from '../../messages';
import { ChartWidgetProps } from '../../typings';

import GenderCard from './GenderCard';

const GenderWidget = ({ title, ...props }: ChartWidgetProps) => {
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

/** @deprecated This widget should not be used for new reports anymore */
export const genderTitle = messages.usersByGender;

/** @deprecated This widget should not be used for new reports anymore */
export default GenderWidget;
