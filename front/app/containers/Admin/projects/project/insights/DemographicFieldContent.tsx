import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { DemographicField } from 'api/phase_insights/types';

import ComparisonBarChart from 'components/admin/Graphs/ComparisonBarChart';
import ReportExportMenu from 'components/admin/ReportExportMenu';

import { useIntl } from 'utils/cl-intl';

import RScore from './audience/RScore';
import { toChartData, toExcelData } from './audience/utils';
import messages from './messages';

interface Props {
  field: DemographicField;
  showExportMenu?: boolean;
}

const DemographicFieldContent = ({ field, showExportMenu = true }: Props) => {
  const { formatMessage } = useIntl();

  // Check if any data point has population data (reference distribution exists)
  const hasPopulationData = field.data_points.some(
    (point) => point.population_percentage !== undefined
  );

  return (
    <Box mb="24px">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="8px"
      >
        <Text fontSize="l" fontWeight="bold" m="0px">
          {field.field_name}
        </Text>
        {showExportMenu && (
          <ReportExportMenu
            name={field.field_name}
            xlsx={{ data: toExcelData(field) }}
          />
        )}
      </Box>

      {hasPopulationData && field.r_score !== undefined && (
        <Box mb="8px">
          <RScore value={field.r_score} />
        </Box>
      )}

      <Box display="flex" gap="24px" mb="12px">
        <Box display="flex" gap="8px" alignItems="center">
          <Box
            width="8px"
            height="8px"
            borderRadius="50%"
            background="#2f478a"
            aria-hidden="true"
          />
          <Text fontSize="s" color="coolGrey700" m="0px">
            {formatMessage(messages.participants)}
          </Text>
        </Box>
        {hasPopulationData && (
          <Box display="flex" gap="8px" alignItems="center">
            <Box
              width="8px"
              height="8px"
              borderRadius="50%"
              background={colors.teal300}
              aria-hidden="true"
            />
            <Text fontSize="s" color="coolGrey700" m="0px">
              {formatMessage(messages.totalPopulation)}
            </Text>
          </Box>
        )}
      </Box>

      <ComparisonBarChart
        data={toChartData(field)}
        mapping={{
          category: 'category',
          primaryValue: 'participants',
          comparisonValue: 'population',
        }}
        showComparison={hasPopulationData}
        primaryColor="#2f478a"
        comparisonColor={colors.teal300}
      />
    </Box>
  );
};

export default DemographicFieldContent;
