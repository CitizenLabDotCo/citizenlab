import React from 'react';

// craft
import { useNode } from '@craftjs/core';
import { Box, Input, Title } from '@citizenlab/cl2-component-library';
import { Moment } from 'moment';
import TimeControl from '../../../../../../../containers/Admin/dashboard/components/TimeControl';
import ProjectFilter from '../../../../../../../containers/Admin/dashboard/components/filters/ProjectFilter';
import { IOption } from 'typings';
import VisitorsCard from '../../../../../analytics/admin/components/VisitorsCard';
import VisitorsTrafficSourcesCard from '../../../../../analytics/admin/components/VisitorsTrafficSourcesCard';
import { injectIntl } from '../../../../../../../utils/cl-intl';
import messages from '../../../messages';
import GenderChart from '../../../../../../../containers/Admin/dashboard/users/Charts/GenderChart';
import AgeChart from '../../../../../../../containers/Admin/dashboard/users/Charts/AgeChart';
import { IResolution } from '../../../../../../../components/admin/ResolutionControl';

interface Props {
  title: string;
  chartType: string;
  projectId: string | undefined;
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null;
}

const AnalyticsChartWidget = ({
  title,
  chartType,
  projectId,
  startAtMoment,
  endAtMoment,
}: Props) => {
  const resolution: IResolution = 'month';
  const analyticsChartProps = {
    projectId,
    startAtMoment,
    endAtMoment,
    resolution,
    reportConfig: { title },
  };

  const statChartProps = {
    startAt: startAtMoment?.format('YYYY-MM-DDTHH:mm:ss.sss'),
    // endAt: startAtMoment?.format('YYYY-MM-DDTHH:mm:ss.sss'), // TODO: AgeChart doesn't like this being undefined
    endAt: null,
    className: 'fullWidth',
    currentGroupFilter: undefined,
    currentGroupFilterLabel: undefined,
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

const AnalyticsChartWidgetSettings = injectIntl(
  ({ intl: { formatMessage } }) => {
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
      startAtMoment: node.data.props.startAtMoment,
      endAtMoment: node.data.props.endAtMoment,
      chartType: node.data.props.chartType,
    }));

    const setTitle = (value: string) => {
      setProp((props) => {
        props.title = value;
      });
    };

    const handleChangeTimeRange = (
      startAtMoment: Moment | null,
      endAtMoment: Moment | null
    ) => {
      setProp((props) => {
        props.startAtMoment = startAtMoment;
        props.endAtMoment = endAtMoment;
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
          <TimeControl
            startAtMoment={startAtMoment}
            endAtMoment={endAtMoment}
            onChange={handleChangeTimeRange}
            hidePresets={true}
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
  }
);

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
};

export default AnalyticsChartWidget;
