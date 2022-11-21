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
import GenderChart from '../../../../../user_custom_fields/admin/components/GenderChart';
import AgeChart from '../../../../../user_custom_fields/admin/components/AgeChart';

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
  let chart = <></>;
  switch (chartType) {
    case 'VisitorsCard':
      chart = (
        <VisitorsCard
          projectId={projectId}
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          resolution={'month'}
          reportConfig={{ title }}
        />
      );
      break;
    case 'VisitorsTrafficSourcesCard':
      chart = (
        <VisitorsTrafficSourcesCard
          projectId={projectId}
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          reportConfig={{ title }}
        />
      );
      break;
    case 'GenderChart':
      // TODO: Plugin start & end dates
      chart = (
        <GenderChart
          startAt={null}
          endAt={null}
          currentGroupFilter={undefined}
          currentGroupFilterLabel={undefined}
        />
      );
      break;
    case 'AgeChart':
      chart = (
        <AgeChart
          startAt={null}
          endAt={null}
          currentGroupFilter={undefined}
          currentGroupFilterLabel={undefined}
        />
      );
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
    } = useNode((node) => ({
      title: node.data.props.title,
      projectId: node.data.props.projectId,
      startAtMoment: node.data.props.startAtMoment,
      endAtMoment: node.data.props.endAtMoment,
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
              <Title variant="h3" color="tenantText" mb={'0'}>
                {formatMessage(messages.analyticsChartTitle)}
              </Title>
            }
            type="text"
            value={title}
            onChange={setTitle}
          />
        </Box>
        <Box mb="20px">
          <TimeControl
            startAtMoment={startAtMoment}
            endAtMoment={endAtMoment}
            onChange={handleChangeTimeRange}
          />
        </Box>
        <Box mb="20px">
          <ProjectFilter
            currentProjectFilter={projectId}
            width="100%"
            padding="11px"
            onProjectFilter={handleProjectFilter}
          />
        </Box>
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
