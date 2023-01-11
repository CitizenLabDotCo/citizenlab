import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import ActiveUsers from './ActiveUsersCard';

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

const ActiveUsersWidget = ({
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
      <ActiveUsers {...analyticsChartProps} />
    </Box>
  );
};

ActiveUsersWidget.craft = {
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
    title: messages.activeUsersTimeline,
    noPointerEvents: true,
  },
};

export default ActiveUsersWidget;
