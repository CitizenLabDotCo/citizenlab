import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { useDemographics } from 'api/graph_data_units';

import useLocalize from 'hooks/useLocalize';

import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import Card from '../../_shared/Card';
import NoData from '../../_shared/NoData';
import chartWidgetMessages from '../messages';

import messages from './messages';
import Settings from './Settings';
import Chart from './StackedBarChart';
import { Props } from './typings';

const DemographicsWidget = ({
  title,
  projectId,
  startAt,
  endAt,
  customFieldId,
  groupId,
}: Props) => {
  const localize = useLocalize();

  const { data: demographicsResponse, isLoading } = useDemographics({
    custom_field_id: customFieldId,
    project_id: projectId,
    start_at: startAt,
    end_at: endAt,
    group_id: groupId,
  });

  const layout = useLayout();

  if (isLoading) return null;

  if (!demographicsResponse) {
    return (
      <Box>
        <NoData message={chartWidgetMessages.noData} />
      </Box>
    );
  }

  if (layout === 'narrow') {
    return (
      <Card pagebreak className="e2e-demographics-widget">
        <Title variant="h4" mt="1px">
          {localize(title)}
        </Title>
        <Chart response={demographicsResponse} />
      </Card>
    );
  }

  return (
    <Card pagebreak className="e2e-demographics-widget">
      <Box width="100%" pb="0px" display="flex">
        <Box w="300px" display="flex" flexDirection="column">
          <Title variant="h4" mt="1px" pr="16px">
            {localize(title)}
          </Title>
        </Box>
        <Chart response={demographicsResponse} />
      </Box>
    </Card>
  );
};

DemographicsWidget.craft = {
  props: {
    title: undefined,
    projectId: undefined,
    startAt: undefined,
    endAt: null,
    customFieldId: undefined,
    groupId: undefined,
  },
  related: {
    settings: Settings,
  },
};

export const demographicsTitle = messages.demographics;

export default DemographicsWidget;
