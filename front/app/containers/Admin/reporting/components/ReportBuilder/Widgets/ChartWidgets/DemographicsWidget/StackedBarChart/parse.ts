import { DemographicsResponse } from 'api/graph_data_units/responseTypes';

import { Localize } from 'hooks/useLocalize';

import { DEFAULT_CATEGORICAL_COLORS } from 'components/admin/Graphs/styling';

import { roundPercentages } from 'utils/math';

export const parseResponse = (
  response: DemographicsResponse,
  localize: Localize,
  blankLabel: string
) => {
  const { options } = response.data.attributes;

  // Birthyear data is the only data that does not have options
  const isBirthyearData = options === undefined;

  if (isBirthyearData) {
    // TODO
    throw new Error('');
    // return {};
  }

  const data: [Record<string, number>] = [
    { ...response.data.attributes.series },
  ];
  const columns = Object.keys(data[0]);
  const percentages = roundPercentages(
    columns.map((column) => data[0][column])
  );
  const statusColorById = columns.reduce(
    (acc, cur, i) => ({
      ...acc,
      [cur]: DEFAULT_CATEGORICAL_COLORS[i % DEFAULT_CATEGORICAL_COLORS.length],
    }),
    {}
  );

  const labels = columns.map((column) => {
    if (column === '_blank') return blankLabel;
    return localize(options[column].title_multiloc);
  });

  const legendItems = columns.map((column, i) => ({
    icon: 'circle' as const,
    color: statusColorById[column] as string,
    label: labels[i],
  }));

  return { data, percentages, columns, statusColorById, labels, legendItems };
};
