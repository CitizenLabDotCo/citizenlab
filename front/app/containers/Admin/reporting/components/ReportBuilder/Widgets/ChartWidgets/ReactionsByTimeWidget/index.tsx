import React from 'react';

import messages from 'containers/Admin/dashboard/messages';

import Card from '../../_shared/Card';
import TimeSeriesWidgetSettings from '../_shared/TimeSeriesWidgetSettings';
import { TimeSeriesWidgetProps } from '../typings';

import ReactionsByTimeCard from './ReactionsByTimeCard';

const ReactionsByTimeWidget = ({ title, ...props }: TimeSeriesWidgetProps) => {
  return (
    <Card title={title} pagebreak>
      <ReactionsByTimeCard {...props} />
    </Card>
  );
};

ReactionsByTimeWidget.craft = {
  props: {
    title: {},
    projectId: undefined,
    startAt: undefined,
    endAt: null,
    resolution: undefined,
  },
  related: {
    settings: TimeSeriesWidgetSettings,
  },
};

export const reactionsByTimeTitle = messages.reactions;

export default ReactionsByTimeWidget;
