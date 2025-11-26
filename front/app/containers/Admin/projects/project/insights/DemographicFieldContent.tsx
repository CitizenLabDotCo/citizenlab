import React from 'react';

import { Box, Text } from 'component-library';

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

  return (
    <Box display="flex" gap="40px" mb="24px">
      {/* Left side: Chart (60% width) */}
      <Box flexGrow={1} minWidth="0">
        {/* Field name and download button */}
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

        {/* R.Score */}
        {field.r_score !== undefined && (
          <Box mb="8px">
            <RScore value={field.r_score} />
          </Box>
        )}

        {/* Legend */}
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
          <Box display="flex" gap="8px" alignItems="center">
            <Box
              width="8px"
              height="8px"
              borderRadius="50%"
              background="#40b8c5"
              aria-hidden="true"
            />
            <Text fontSize="s" color="coolGrey700" m="0px">
              {formatMessage(messages.totalPopulation)}
            </Text>
          </Box>
        </Box>

        {/* Chart */}
        <ComparisonBarChart
          data={toChartData(field)}
          mapping={{
            category: 'category',
            primaryValue: 'participants',
            comparisonValue: 'population',
          }}
          primaryColor="#2f478a"
          comparisonColor="#40b8c5"
        />
      </Box>

      {/* Right side: Placeholder for Auto Insights (35% width) - hidden in PDF */}
      <Box
        width="35%"
        minWidth="300px"
        background="#f7f8f9"
        borderRadius="8px"
        p="16px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        data-pdf-exclude="true"
        className="auto-insights-placeholder"
      >
        <Text color="textSecondary" fontSize="s" textAlign="center">
          Auto Insights
          <br />
          Coming soon
        </Text>
      </Box>
    </Box>
  );
};

export default DemographicFieldContent;
