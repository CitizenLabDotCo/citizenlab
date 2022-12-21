import React from 'react';

// Components
import { Box } from '@citizenlab/cl2-component-library';
import GenderCard from '../GenderWidget/GenderCard';
import AgeCard from '../AgeWidget/AgeCard';
import VisitorsCard from '../VisitorsWidget/VisitorsCard';
import VisitorsTrafficSourcesCard from '../VisitorsTrafficSourcesWidget/VisitorTrafficSourcesCard';

// styling
import { stylingConsts } from 'utils/styleUtils';
import { BORDER } from '../../constants';

// Utils
import moment from 'moment';

// Settings
import messages from '../messages';

// Types
import { IResolution } from 'components/admin/ResolutionControl';
import { ChartWidgetSettings } from '../ChartWidgetSettings';

interface Props {
  title: string;
  chartType:
    | 'VisitorsCard'
    | 'VisitorsTrafficSourcesCard'
    | 'GenderChart'
    | 'AgeChart';
  projectId: string | undefined;
  startAt: string | null | undefined;
  endAt: string | null;
}

const AnalyticsChartWidget = ({
  title,
  chartType,
  projectId,
  startAt,
  endAt,
}: Props) => {
  const startAtMoment = startAt ? moment(startAt) : null;
  const endAtMoment = endAt ? moment(endAt) : null;
  const resolution: IResolution = 'month';
  const analyticsChartProps = {
    projectId,
    startAtMoment,
    endAtMoment,
    resolution,
    title,
  };

  const statChartProps = {
    startAt,
    endAt,
    title,
    projectId,
  };

  let chart = <></>;
  switch (chartType) {
    case 'VisitorsCard':
      chart = <VisitorsCard {...analyticsChartProps} />;
      break;
    case 'VisitorsTrafficSourcesCard':
      chart = <VisitorsTrafficSourcesCard {...analyticsChartProps} />;
      break;
    case 'GenderChart':
      chart = <GenderCard {...statChartProps} />;
      break;
    case 'AgeChart':
      chart = <AgeCard {...statChartProps} />;
      break;
  }

  return (
    <Box
      minHeight="26px"
      border={BORDER}
      borderRadius={stylingConsts.borderRadius}
      mt="4px"
      mb="4px"
    >
      {chart}
    </Box>
  );
};

AnalyticsChartWidget.craft = {
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
    // TODO: Make this title change dynamically based on the chart type (CL-2254)
    title: messages.analyticsChart,
    noPointerEvents: true,
  },
};

export default AnalyticsChartWidget;
