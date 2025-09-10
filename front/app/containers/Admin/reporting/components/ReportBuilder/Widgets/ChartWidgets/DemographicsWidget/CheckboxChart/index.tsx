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

    // For checkbox fields, we expect '_blank', 'true', 'false' keys
    const res = ['_blank', 'true', 'false'].map((key) => ({
      value: series[key] || 0,
      name: formatMessage(dashboardMessages[key]),
      code: key,
    }));

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
