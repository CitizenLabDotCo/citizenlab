import React from 'react';

import messages from 'containers/Admin/dashboard/messages';

import Card from '../../../_shared/Card';
import TimeSeriesWidgetSettings from '../../_shared/TimeSeriesWidgetSettings';
import { TimeSeriesWidgetProps } from '../../typings';

import CommentsByTimeCard from './CommentsByTimeCard';

const CommentsByTimeWidget = ({ title, ...props }: TimeSeriesWidgetProps) => {
  return (
    <Card title={title} className="e2e-comments-by-time-widget" pagebreak>
      <CommentsByTimeCard {...props} />
    </Card>
  );
};

CommentsByTimeWidget.craft = {
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

/** @deprecated This widget should not be used for new reports anymore */
export const commentsByTimeTitle = messages.comments;

/** @deprecated This widget should not be used for new reports anymore */
export default CommentsByTimeWidget;
