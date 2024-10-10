import { Multiloc } from 'typings';

import { DemographicsResponse } from 'api/graph_data_units/responseTypes/DemographicsWidget';

import { Localize } from 'hooks/useLocalize';

import { DEFAULT_CATEGORICAL_COLORS } from 'components/admin/Graphs/styling';

import { binAge } from 'utils/dataUtils';
import { roundPercentages } from 'utils/math';

export const parseResponse = (
  response: DemographicsResponse,
  localize: Localize,
  blankLabel: string
) => {
  const { options } = response.data.attributes;

  // Birthyear is the only custom field we support here
  // that does not have options
  const isBirthyearData = options === undefined;

  if (isBirthyearData) {
    return parseBirthyearResponse(response.data.attributes.series, blankLabel);
  }

  return parseOtherResponse(
    response.data.attributes.series,
    options,
    localize,
    blankLabel
  );
};

const parseBirthyearResponse = (
  series: DemographicsResponse['data']['attributes']['series'],
  blankLabel: string
) => {
  const bins = binAge(series, {
    missingBin: blankLabel,
  });

  const binHash = bins.reduce(
    (acc, { value, name }) => ({
      ...acc,
      [name]: value,
    }),
    {} as Record<string, number>
  );

  const data: [Record<string, number>] = [binHash];

  const columns = Object.keys(binHash);
  const percentages = roundPercentages(
    columns.map((column) => binHash[column])
  );

  const statusColorById = createColorMap(columns);

  const legendItems = columns.map((column) => {
    return {
      icon: 'circle' as const,
      color: statusColorById[column],
      label: column,
      value: data[0][column],
    };
  });

  return {
    data,
    percentages,
    columns,
    statusColorById,
    labels: columns,
    legendItems,
  };
};

const parseOtherResponse = (
  series: DemographicsResponse['data']['attributes']['series'],
  options: Record<string, { title_multiloc: Multiloc; ordering: number }>,
  localize: Localize,
  blankLabel: string
) => {
  const data: [Record<string, number>] = [series];

  const columnsWithoutBlank = Object.keys(options).sort(
    (a, b) => options[a].ordering - options[b].ordering
  );

  const columns = [...columnsWithoutBlank, '_blank'];

  const sortedColumns = columns.sort((a, b) => data[0][b] - data[0][a]);

  const percentages = roundPercentages(
    sortedColumns.map((column) => data[0][column])
  );
  const statusColorById = createColorMap(sortedColumns);

  const labels = sortedColumns.map((column) => {
    if (column === '_blank') return blankLabel;
    return localize(options[column].title_multiloc);
  });

  const legendItems = sortedColumns.map((column, i) => {
    return {
      icon: 'circle' as const,
      color: statusColorById[column],
      label: labels[i],
      value: data[0][column],
    };
  });

  return {
    data,
    percentages,
    columns: sortedColumns,
    statusColorById,
    labels,
    legendItems,
  };
};

const createColorMap = (columns: string[]) => {
  return columns.reduce(
    (acc, cur, i) => ({
      ...acc,
      [cur]: DEFAULT_CATEGORICAL_COLORS[i % DEFAULT_CATEGORICAL_COLORS.length],
    }),
    {} as Record<string, string>
  );
};
