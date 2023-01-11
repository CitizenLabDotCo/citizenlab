import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import VisitorsCard from './VisitorsCard';

// styling
import { stylingConsts } from 'utils/styleUtils';
import { BORDER } from '../../constants';

// utils
import moment from 'moment';

// settings
import messages from '../messages';

// types
import { IResolution } from 'components/admin/ResolutionControl';
import { ChartWidgetSettings } from '../ChartWidgetSettings';
import { ChartWidgetProps } from '../typings';

const VisitorsWidget = ({
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
    title,
  };

  return (
    <Box
      minHeight="26px"
      border={BORDER}
      borderRadius={stylingConsts.borderRadius}
      mt="4px"
      mb="4px"
    >
      <VisitorsCard {...analyticsChartProps} />
    </Box>
  );
};

VisitorsWidget.craft = {
  props: {
    title: '',
    projectFilter: undefined,
    startAt: undefined,
    endAt: undefined,
  },
  related: {
    settings: ChartWidgetSettings,
  },
  custom: {
    title: messages.visitorTimeline,
    noPointerEvents: true,
  },
};

export default VisitorsWidget;
