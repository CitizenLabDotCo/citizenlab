import React from 'react';

import Card from '../../_shared/Card';
import PostsByTimeCard from './PostsByTimeCard';
import ChartWidgetSettings from '../_shared/ChartWidgetSettings';

import moment from 'moment';

// settings
import messages from 'containers/Admin/dashboard/messages';

import { IResolution } from 'components/admin/ResolutionControl';
import { ChartWidgetProps } from '../typings';

const PostsByTimeWidget = ({
  title,
  projectId,
  startAt,
  endAt,
}: ChartWidgetProps) => {
  const resolution: IResolution = 'month';
  const analyticsChartProps = {
    startAtMoment: startAt ? moment(startAt) : null,
    endAtMoment: endAt ? moment(endAt) : null,
    projectId,
    resolution,
  };

  return (
    <Card title={title} pagebreak>
      <PostsByTimeCard {...analyticsChartProps} />
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
