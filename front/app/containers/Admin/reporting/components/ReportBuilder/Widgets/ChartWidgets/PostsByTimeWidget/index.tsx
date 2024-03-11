import React from 'react';

import messages from 'containers/Admin/dashboard/messages';

import Card from '../../_shared/Card';
import ChartWidgetSettings from '../_shared/ChartWidgetSettings';
import { ChartWidgetProps } from '../typings';

import PostsByTimeCard from './PostsByTimeCard';

const PostsByTimeWidget = ({ title, ...props }: ChartWidgetProps) => {
  return (
    <Card title={title} pagebreak>
      <PostsByTimeCard {...props} resolution="month" />
    </Card>
  );
};

PostsByTimeWidget.craft = {
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

export const postsByTimeTitle = messages.inputs;

export default PostsByTimeWidget;
