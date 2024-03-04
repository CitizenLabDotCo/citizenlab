import React from 'react';

import messages from 'containers/Admin/dashboard/messages';
import moment from 'moment';

import { IResolution } from 'components/admin/ResolutionControl';

import Card from '../../_shared/Card';
import ChartWidgetSettings from '../_shared/ChartWidgetSettings';
import { ChartWidgetProps } from '../typings';

import ReactionsByTimeCard from './ReactionsByTimeCard';

const ReactionsByTimeWidget = ({
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
      <ReactionsByTimeCard {...analyticsChartProps} />
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
