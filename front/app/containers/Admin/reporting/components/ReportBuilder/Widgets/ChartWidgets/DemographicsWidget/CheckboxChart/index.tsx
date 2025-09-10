import React from 'react';

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

interface Props {
  response: DemographicsResponse;
}

interface Serie {
  value: number;
  name: string;
  code: string;
  percentage: number;
}

const CheckboxChart = ({ response }: Props) => {
  const { formatMessage } = useIntl();

  // Convert demographics response to checkbox format
  const convertToCheckboxFormat = (data: DemographicsResponse) => {
    const { series } = data.data.attributes;

    // Get all keys from the series data (universal approach)
    const allKeys = Object.keys(series);

    // Map each key to a display format
    const res = allKeys.map((key) => {
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

    return res.length > 0 ? res : null;
  };

  const serie = convertToCheckboxFormat(response);

  if (!serie) {
    return (
      <NoDataContainer>
        <FormattedMessage {...dashboardMessages.noData} />
      </NoDataContainer>
    );
  }

  const percentages = roundPercentages(serie.map((row) => row.value));
  const percentagesSerie: Serie[] = serie.map((row, i) => ({
    ...row,
    percentage: percentages[i],
  }));

  const makeLegends = (row: Serie, i: number) => ({
    icon: 'circle' as const,
    color: categoricalColorScheme({ rowIndex: i }),
    label: `${row.name} (${row.percentage}%)`,
  });

  return (
    <GraphCard>
      <GraphCardInner>
        <PieChartStyleFixesDiv>
          <PieChart
            data={percentagesSerie}
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
              items: percentagesSerie.map(makeLegends),
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
