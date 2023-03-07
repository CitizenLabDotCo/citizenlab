import React from 'react';

// components
import Card from '../../_shared/Card';
import VotesByTimeCard from './VotesByTimeCard';
import ChartWidgetSettings from '../_shared/ChartWidgetSettings';

// utils
import moment from 'moment';

// settings
import messages from 'containers/Admin/dashboard/messages';

// types
import { IResolution } from 'components/admin/ResolutionControl';
import { ChartWidgetProps } from '../typings';

const VotesByTimeWidget = ({
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
      <VotesByTimeCard {...analyticsChartProps} />
    </Card>
  );
};

VotesByTimeWidget.craft = {
  props: {
    title: '',
    projectFilter: undefined,
    startAt: undefined,
    endAt: null,
  },
  related: {
    settings: ChartWidgetSettings,
  },
  custom: {
    title: messages.votes,
    noPointerEvents: true,
  },
};

export default VotesByTimeWidget;
