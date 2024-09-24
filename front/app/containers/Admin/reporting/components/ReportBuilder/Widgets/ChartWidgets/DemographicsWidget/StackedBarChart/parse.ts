import { colors } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { DemographicsResponse } from 'api/graph_data_units/responseTypes/DemographicsWidget';

import { Localize } from 'hooks/useLocalize';

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

  // Separate bins with non-zero values from bins with zero values
  const nonZeroBins = bins.filter((bin) => bin.value > 0);
  const zeroBins = bins.filter((bin) => bin.value === 0);

  // Sort non-zero bins by value in descending order
  const sortedNonZeroBins = nonZeroBins.sort((a, b) => b.value - a.value);

  const binHash = sortedNonZeroBins.reduce(
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

  const legendItems = columns.map((column) => ({
    icon: 'circle' as const,
    color: statusColorById[column],
    label: column,
  }));

  return {
    data,
    percentages,
    columns,
    statusColorById,
    labels: columns,
    legendItems,
    noDataBins: zeroBins.map((bin) => bin.name),
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

  // Separate columns with non-zero values from columns with zero values
  const nonZeroColumns = columns.filter((column) => data[0][column] > 0);
  const zeroColumns = columns.filter((column) => data[0][column] === 0);

  // Sort non-zero columns by value in descending order
  const sortedNonZeroColumns = nonZeroColumns.sort(
    (a, b) => data[0][b] - data[0][a]
  );

  const percentages = roundPercentages(
    sortedNonZeroColumns.map((column) => data[0][column])
  );
  const statusColorById = createColorMap(sortedNonZeroColumns);

  const labels = sortedNonZeroColumns.map((column) => {
    if (column === '_blank') return blankLabel;
    return localize(options[column].title_multiloc);
  });

  const legendItems = sortedNonZeroColumns.map((column, i) => ({
    icon: 'circle' as const,
    color: statusColorById[column],
    label: labels[i],
  }));

  // Return chart data and "No Data" columns separately
  return {
    data,
    percentages,
    columns: sortedNonZeroColumns,
    statusColorById,
    labels,
    legendItems,
    noDataBins: zeroColumns.map((column) =>
      localize(options[column].title_multiloc)
    ),
  };
};

const generateColorGradient = (
  numberOfGroups: number,
  startColor: string,
  endColor: string
): string[] => {
  const colors: string[] = [];
  for (let i = 0; i < numberOfGroups; i++) {
    const ratio = i / (numberOfGroups - 1);
    const interpolatedColor = interpolateColor(startColor, endColor, ratio);
    colors.push(interpolatedColor);
  }
  return colors;
};

const interpolateColor = (
  startColor: string,
  endColor: string,
  ratio: number
): string => {
  const r = Math.ceil(
    parseInt(endColor.slice(1, 3), 16) * ratio +
      parseInt(startColor.slice(1, 3), 16) * (1 - ratio)
  );
  const g = Math.ceil(
    parseInt(endColor.slice(3, 5), 16) * ratio +
      parseInt(startColor.slice(3, 5), 16) * (1 - ratio)
  );
  const b = Math.ceil(
    parseInt(endColor.slice(5, 7), 16) * ratio +
      parseInt(startColor.slice(5, 7), 16) * (1 - ratio)
  );

  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
};

const createColorMap = (columns: string[]): Record<string, string> => {
  const startColor = colors.primary;
  const endColor = colors.teal300;
  const colorGradient = generateColorGradient(
    columns.length,
    startColor,
    endColor
  );

  // Assign each column a color from the gradient
  return columns.reduce<Record<string, string>>(
    (acc, cur, i) => ({
      ...acc,
      [cur]: colorGradient[i],
    }),
    {}
  );
};
