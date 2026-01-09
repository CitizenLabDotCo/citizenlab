import React, { useRef, useEffect } from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { DemographicField } from 'api/phase_insights/types';

import ComparisonBarChart from 'components/admin/Graphs/ComparisonBarChart';
import ReportExportMenu from 'components/admin/ReportExportMenu';

import { useIntl } from 'utils/cl-intl';

import { INSIGHTS_CHART_COLORS } from '../constants';
import messages from '../messages';

import RScore from './RScore';
import { toChartData, toExcelData } from './utils';

interface Props {
  field: DemographicField;
  showExportMenu?: boolean;
  onChartRef?: (fieldId: string, el: HTMLElement | null) => void;
}

const DemographicFieldContent = ({
  field,
  showExportMenu = true,
  onChartRef,
}: Props) => {
  const { formatMessage } = useIntl();
  const chartRef = useRef<HTMLElement>(null);

  // Register the chart element with parent when mounted
  useEffect(() => {
    if (onChartRef) {
      onChartRef(field.field_id, chartRef.current);
    }
    return () => {
      if (onChartRef) {
        onChartRef(field.field_id, null);
      }
    };
  }, [field.field_id, onChartRef]);

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
            xlsx={{ data: toExcelData(field, formatMessage) }}
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
            background={INSIGHTS_CHART_COLORS.darkBlue}
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
        primaryColor={INSIGHTS_CHART_COLORS.darkBlue}
        comparisonColor={colors.teal300}
        innerRef={chartRef}
      />
    </Box>
  );
};

export default DemographicFieldContent;
