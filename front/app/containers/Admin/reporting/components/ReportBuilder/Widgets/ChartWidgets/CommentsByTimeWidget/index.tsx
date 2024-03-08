import React from 'react';

import messages from 'containers/Admin/dashboard/messages';

import Card from '../../_shared/Card';
import ChartWidgetSettings from '../_shared/ChartWidgetSettings';
import { ChartWidgetProps } from '../typings';

import CommentsByTimeCard from './CommentsByTimeCard';

const CommentsByTimeWidget = ({ title, ...props }: ChartWidgetProps) => {
  return (
    <Card title={title} className="e2e-comments-by-time-widget" pagebreak>
      <CommentsByTimeCard {...props} resolution="month" />
    </Card>
  );
};

CommentsByTimeWidget.craft = {
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

export const commentsByTimeTitle = messages.comments;

export default CommentsByTimeWidget;
