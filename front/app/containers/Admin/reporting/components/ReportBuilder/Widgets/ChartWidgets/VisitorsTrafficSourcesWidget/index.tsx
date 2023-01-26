import React from 'react';

// components
import VisitorsTrafficSourcesCard from './VisitorTrafficSourcesCard';
import PageBreakBox from '../../../../../../../../components/admin/ContentBuilder/Widgets/PageBreakBox';

// styling
import { stylingConsts } from 'utils/styleUtils';
import { BORDER } from '../../constants';

// utils
import moment from 'moment';

// messages
import messages from '../messages';

// settings
import ChartWidgetSettings from '../ChartWidgetSettings';

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
    <PageBreakBox
      minHeight="26px"
      border={BORDER}
      borderRadius={stylingConsts.borderRadius}
      mt="4px"
      mb="4px"
    >
      <VisitorsTrafficSourcesCard {...analyticsChartProps} />
    </PageBreakBox>
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
