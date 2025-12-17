import React from 'react';

import { FormatMessage } from 'typings';

import { DemographicsResponse } from 'api/graph_data_units/responseTypes/DemographicsWidget';

import dashboardMessages from 'containers/Admin/dashboard/messages';

import PieChart from 'components/admin/Graphs/PieChart';
import { categoricalColorScheme } from 'components/admin/Graphs/styling';
import {
  NoDataContainer,
  GraphCard,
  GraphCardInner,
  PieChartStyleFixesDiv,
} from 'components/admin/GraphWrappers';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { roundPercentages } from 'utils/math';

interface IntermediateSerie {
  value: number;
  name: string;
  code: string;
}

// Convert demographics response to checkbox format
const convertToCheckboxFormat = (
  data: DemographicsResponse,
  formatMessage: FormatMessage
): IntermediateSerie[] | null => {
  const { series } = data.data.attributes;

  // Get all keys from the series data (universal approach)
  const allKeys = Object.keys(series);
  if (allKeys.length === 0) {
    return null;
  }

  // Map each key to a display format
  return allKeys.map((key) => {
    let displayName: string;

    // Handle special cases with proper internationalization
    if (key === '_blank') {
      displayName = formatMessage(dashboardMessages._blank);
    } else if (key === 'true') {
      displayName = formatMessage(dashboardMessages.true);
    } else if (key === 'false') {
      displayName = formatMessage(dashboardMessages.false);
    } else {
      // For any other keys, use the key as display name
      // This handles custom checkbox values or other boolean representations
      displayName = key;
    }

    return {
      value: series[key] || 0,
      name: displayName,
      code: key,
    };
  });
};

interface Props {
  response: DemographicsResponse;
}

interface SerieWithPercentage {
  value: number;
  name: string;
  code: string;
  percentage: number;
}

const CheckboxChart = ({ response }: Props) => {
  const { formatMessage } = useIntl();
  const chartData = convertToCheckboxFormat(response, formatMessage);

  if (!chartData) {
    return (
      <NoDataContainer>
        <FormattedMessage {...dashboardMessages.noData} />
      </NoDataContainer>
    );
  }

  const percentages = roundPercentages(
    chartData.map((dataItem) => dataItem.value)
  );

  const finalChartSeries: SerieWithPercentage[] = chartData.map(
    (dataItem, index) => ({
      ...dataItem,
      percentage: percentages[index],
    })
  );

  const legendItems = finalChartSeries.map((seriesItem, index) => ({
    icon: 'circle' as const,
    color: categoricalColorScheme({ rowIndex: index }),
    label: `${seriesItem.name} (${seriesItem.percentage}%)`,
  }));

  return (
    <GraphCard>
      <GraphCardInner>
        <PieChartStyleFixesDiv>
          <PieChart
            data={finalChartSeries}
            width={164}
            mapping={{
              angle: 'value',
              name: 'name',
            }}
            pie={{
              startAngle: 0,
              endAngle: 360,
              outerRadius: 60,
            }}
            legend={{
              items: legendItems,
              maintainGraphSize: true,
              marginLeft: 50,
              position: 'right-center',
            }}
          />
        </PieChartStyleFixesDiv>
      </GraphCardInner>
    </GraphCard>
  );
};

export default CheckboxChart;
