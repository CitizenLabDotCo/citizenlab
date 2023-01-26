import React from 'react';

// components
import VisitorsCard from './VisitorsCard';
import PageBreakBox from '../../../../../../../../components/admin/ContentBuilder/Widgets/PageBreakBox';

// styling
import { stylingConsts } from 'utils/styleUtils';
import { BORDER } from '../../constants';

// utils
import moment from 'moment';

// settings
import messages from '../messages';
import ChartWidgetSettings from '../_shared/ChartWidgetSettings';

// types
import { IResolution } from 'components/admin/ResolutionControl';
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
    <PageBreakBox
      minHeight="26px"
      border={BORDER}
      borderRadius={stylingConsts.borderRadius}
      mt="4px"
      mb="4px"
    >
      <VisitorsCard {...analyticsChartProps} />
    </PageBreakBox>
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
