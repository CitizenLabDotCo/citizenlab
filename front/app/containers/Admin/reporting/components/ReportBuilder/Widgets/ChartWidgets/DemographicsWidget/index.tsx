import React, { useMemo } from 'react';

import { Box, Title, colors } from '@citizenlab/cl2-component-library';

import { useDemographics } from 'api/graph_data_units';
import useUserCustomField from 'api/user_custom_fields/useUserCustomField';

import useLocalize from 'hooks/useLocalize';

import RScore from 'containers/Admin/projects/project/insights/demographics/RScore';

import ComparisonBarChart from 'components/admin/Graphs/ComparisonBarChart';

import { useIntl } from 'utils/cl-intl';

import Card from '../../_shared/Card';
import NoData from '../../_shared/NoData';
import chartWidgetMessages from '../messages';

import messages from './messages';
import Settings from './Settings';
import { Props } from './typings';
import { transformReportBuilderDemographics } from './utils';

const DemographicsWidget = ({
  title,
  projectId,
  startAt,
  endAt,
  customFieldId,
  groupId,
}: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const { data: demographicsResponse, isLoading } = useDemographics({
    custom_field_id: customFieldId,
    project_id: projectId,
    start_at: startAt,
    end_at: endAt,
    group_id: groupId,
  });

  const { data: customField } = useUserCustomField(customFieldId);

  // Transform data to ComparisonBarChart format
  const chartData = useMemo(() => {
    if (!demographicsResponse) return [];

    const blankLabel = formatMessage(messages.unknown);
    const customFieldCode = customField?.data.attributes.code ?? undefined;
    return transformReportBuilderDemographics(
      demographicsResponse,
      localize,
      blankLabel,
      customFieldCode
    );
  }, [demographicsResponse, localize, formatMessage, customField]);

  // Check if we have comparison/reference data (will be from backend later)
  const hasComparisonData = chartData.some(
    (row) => row.population !== undefined
  );
  const rScore = demographicsResponse?.data.attributes.r_score;

  if (isLoading) return null;

  if (!demographicsResponse) {
    return (
      <Box>
        <NoData message={chartWidgetMessages.noData} />
      </Box>
    );
  }

  const chartElement = (
    <Box>
      {rScore !== undefined && (
        <Box mb="8px">
          <RScore value={rScore} />
        </Box>
      )}

      <ComparisonBarChart
        data={chartData}
        mapping={{
          category: 'category',
          primaryValue: 'participants',
          comparisonValue: 'population',
          count: 'count',
        }}
        showComparison={hasComparisonData}
        primaryColor="#2f478a"
        comparisonColor={colors.teal300}
        barHeight={16}
      />
    </Box>
  );

  return (
    <Card pagebreak className="e2e-demographics-widget">
      <Title variant="h4" mt="1px" mb="16px">
        {localize(title)}
      </Title>
      {chartElement}
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
