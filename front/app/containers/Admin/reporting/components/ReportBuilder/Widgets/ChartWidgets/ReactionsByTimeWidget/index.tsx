import React from 'react';

import messages from 'containers/Admin/dashboard/messages';

import Card from '../../_shared/Card';
import ChartWidgetSettings from '../_shared/ChartWidgetSettings';
import { ChartWidgetProps } from '../typings';

import ReactionsByTimeCard from './ReactionsByTimeCard';

const ReactionsByTimeWidget = ({ title, ...props }: ChartWidgetProps) => {
  return (
    <Card title={title} pagebreak>
      <ReactionsByTimeCard {...props} resolution="month" />
    </Card>
  );
};

ReactionsByTimeWidget.craft = {
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

export const reactionsByTimeTitle = messages.reactions;

export default ReactionsByTimeWidget;
