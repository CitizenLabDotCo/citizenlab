import React from 'react';

// Components
import { Box, Input, Title } from '@citizenlab/cl2-component-library';
import GenderChart from 'containers/Admin/dashboard/users/Charts/GenderChart';
import AgeChart from 'containers/Admin/dashboard/users/Charts/AgeChart';
import VisitorsCard from '../../../../../../../modules/commercial/analytics/admin/components/VisitorsCard';
import VisitorsTrafficSourcesCard from '../../../../../../../modules/commercial/analytics/admin/components/VisitorsTrafficSourcesCard';

// Utils
import moment, { Moment } from 'moment';
import { useIntl } from 'utils/cl-intl';
import { useNode } from '@craftjs/core';

// Settings
import ProjectFilter from 'containers/Admin/dashboard/components/filters/ProjectFilter';
import DateRangePicker from 'components/admin/DateRangePicker';
import messages from './messages';

// Types
import { IOption } from 'typings';
import { IResolution } from 'components/admin/ResolutionControl';

interface Props {
  title: string;
  chartType:
    | 'VisitorsCard'
    | 'VisitorsTrafficSourcesCard'
    | 'GenderChart'
    | 'AgeChart';
  projectId: string | undefined;
  startAt: string | undefined;
  endAt: string | undefined;
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
    interactive: false,
  };

  const statChartProps = {
    startAt,
    endAt: endAt ? endAt : null,
    className: 'fullWidth',
    currentGroupFilter: undefined,
    currentGroupFilterLabel: undefined,
    title,
    interactive: false,
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
      chart = <GenderChart {...statChartProps} />;
      break;
    case 'AgeChart':
      chart = <AgeChart {...statChartProps} />;
      break;
  }

  return (
    <Box id="e2e-text-box" minHeight="26px">
      {chart}
    </Box>
  );
};

const AnalyticsChartWidgetSettings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    title,
    projectId,
    startAtMoment,
    endAtMoment,
    chartType,
  } = useNode((node) => ({
    title: node.data.props.title,
    projectId: node.data.props.projectId,
    startAtMoment: node.data.props.startAt
      ? moment(node.data.props.startAt)
      : null,
    endAtMoment: node.data.props.endAt ? moment(node.data.props.endAt) : null,
    chartType: node.data.props.chartType,
  }));

  const setTitle = (value: string) => {
    setProp((props) => {
      props.title = value;
    });
  };

  const handleChangeTimeRange = ({
    startDate,
    endDate,
  }: {
    startDate: Moment | null;
    endDate: Moment | null;
  }) => {
    setProp((props) => {
      props.startAt = startDate?.format('YYYY-MM-DDTHH:mm:ss.sss');
      props.endAt = endDate?.format('YYYY-MM-DDTHH:mm:ss.sss');
    });
  };

  const handleProjectFilter = ({ value }: IOption) => {
    setProp((props) => {
      props.projectId = value;
    });
  };

  return (
    <Box>
      <Box background="#ffffff" marginBottom="20px">
        <Input
          id="e2e-analytics-chart-widget-title"
          label={
            <Title variant="h4" color="tenantText" mb={'0'}>
              {formatMessage(messages.analyticsChartTitle)}
            </Title>
          }
          type="text"
          value={title}
          onChange={setTitle}
        />
      </Box>
      <Box mb="20px">
        <Title variant="h4" color="tenantText" mb={'0'}>
          {formatMessage(messages.analyticsChartDateRange)}
        </Title>
        <DateRangePicker
          startDateId={'startAt'}
          endDateId={'endAt'}
          startDate={startAtMoment}
          endDate={endAtMoment}
          onDatesChange={handleChangeTimeRange}
        />
      </Box>
      {chartType !== 'AgeChart' && chartType !== 'GenderChart' && (
        <Box mb="20px">
          <ProjectFilter
            currentProjectFilter={projectId}
            width="100%"
            padding="11px"
            onProjectFilter={handleProjectFilter}
          />
        </Box>
      )}
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
    settings: AnalyticsChartWidgetSettings,
  },
  custom: {
    // TODO: Make this title change dynamically based on the chart type (CL-2254)
    title: messages.analyticsChart,
    noPointerEvents: true,
  },
};

export default AnalyticsChartWidget;
