import React from 'react';

import messages from 'containers/Admin/dashboard/messages';

import Card from '../../../_shared/Card';
import TimeSeriesWidgetSettings from '../../_shared/TimeSeriesWidgetSettings';
import { TimeSeriesWidgetProps } from '../../typings';

import PostsByTimeCard from './PostsByTimeCard';

const PostsByTimeWidget = ({ title, ...props }: TimeSeriesWidgetProps) => {
  return (
    <Card title={title} pagebreak>
      <PostsByTimeCard {...props} />
    </Card>
  );
};

PostsByTimeWidget.craft = {
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
export const postsByTimeTitle = messages.inputs;

/** @deprecated This widget should not be used for new reports anymore */
export default PostsByTimeWidget;
