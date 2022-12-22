import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import VisitorsTrafficSourcesCard from './VisitorTrafficSourcesCard';

// styling
import { stylingConsts } from 'utils/styleUtils';
import { BORDER } from '../../constants';

// utils
import moment from 'moment';

// messages
import messages from '../messages';

// settings
import { ChartWidgetSettings } from '../ChartWidgetSettings';

// types
import { IResolution } from 'components/admin/ResolutionControl';
import { ChartWidgetProps } from '../typings';

const VisitorsTrafficSourcesWidget = ({
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
      <VisitorsTrafficSourcesCard {...analyticsChartProps} />
    </Box>
  );
};

VisitorsTrafficSourcesWidget.craft = {
  props: {
    title: '',
    projectFilter: undefined,
    startAtMoment: undefined,
    endAtMoment: null,
  },
  related: {
    settings: ChartWidgetSettings,
  },
  custom: {
    title: messages.trafficSources,
    noPointerEvents: true,
  },
};

export default VisitorsTrafficSourcesWidget;
