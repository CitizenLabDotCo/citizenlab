import { Multiloc } from 'typings';

import { DemographicsResponse } from 'api/graph_data_units/responseTypes/DemographicsWidget';
import { IUserCustomField } from 'api/user_custom_fields/types';

import { Localize } from 'hooks/useLocalize';

import { DEFAULT_CATEGORICAL_COLORS } from 'components/admin/Graphs/styling';

import { binAge } from 'utils/dataUtils';
import { roundPercentages } from 'utils/math';
import { truncate } from 'utils/textUtils';

export const parseResponse = (
  response: DemographicsResponse,
  localize: Localize,
  blankLabel: string,
  customField?: IUserCustomField
) => {
  const { options } = response.data.attributes;

  // Check if this is birthyear data (has no options and is specifically birthyear)
  // vs other number fields (like household_size) which also have no options
  const customFieldCode = customField?.data.attributes.code;
  const isBirthyearData =
    options === undefined && customFieldCode === 'birthyear';

  if (isBirthyearData) {
    return parseBirthyearResponse(response.data.attributes.series, blankLabel);
  }

  // For other number fields without options, create a simple number distribution
  if (
    options === undefined &&
    customField?.data.attributes.input_type === 'number'
  ) {
    return parseNumberFieldResponse(
      response.data.attributes.series,
      blankLabel
    );
  }

  // If no options are available and it's not a number field, return null
  if (!options) {
    return null;
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

export const parseNumberFieldResponse = (
  series: DemographicsResponse['data']['attributes']['series'],
  blankLabel: string
) => {
  // For number fields, create bins based on the actual values
  const values = Object.keys(series).filter((key) => key !== '_blank');
  const numericValues = values.map(Number).filter((val) => !isNaN(val));

  if (numericValues.length === 0) {
    // No numeric values, just show unknown
    const data: [Record<string, number>] = [
      { [blankLabel]: series._blank || 0 },
    ];
    return {
      data,
      percentages: [100],
      columns: [blankLabel],
      statusColorById: { [blankLabel]: DEFAULT_CATEGORICAL_COLORS[0] },
      labels: [blankLabel],
      legendItems: [
        {
          icon: 'circle' as const,
          color: DEFAULT_CATEGORICAL_COLORS[0],
          label: blankLabel,
          value: series._blank || 0,
        },
      ],
    };
  }

  // Create bins for the numeric values
  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);
  const range = max - min;

  // Create bins based on the range
  const bins: Record<string, number> = {};

  // Determine binning strategy based on data characteristics
  if (range <= 10 && numericValues.length <= 20) {
    // Small range with few unique values: create individual bins
    for (let i = min; i <= max; i++) {
      const key = i.toString();
      bins[key] = series[key] || 0;
    }
  } else if (range <= 50) {
    // Medium range: create bins of size 5
    const binSize = 5;
    for (let i = min; i <= max; i += binSize) {
      const binEnd = Math.min(i + binSize - 1, max);
      const binKey = `${i}-${binEnd}`;
      bins[binKey] = 0;

      // Sum values in this range
      for (let j = i; j <= binEnd; j++) {
        bins[binKey] += series[j.toString()] || 0;
      }
    }
  } else {
    // Large range: create ~5-7 bins
    const numBins = Math.min(
      7,
      Math.max(5, Math.ceil(numericValues.length / 10))
    );
    const binSize = Math.ceil(range / numBins);

    for (let i = min; i <= max; i += binSize) {
      const binEnd = Math.min(i + binSize - 1, max);
      const binKey = binSize === 1 ? i.toString() : `${i}-${binEnd}`;
      bins[binKey] = 0;

      // Sum values in this range
      for (let j = i; j <= binEnd; j++) {
        bins[binKey] += series[j.toString()] || 0;
      }
    }
  }

  // Add unknown/blank values
  if (series._blank) {
    bins[blankLabel] = series._blank;
  }

  const data: [Record<string, number>] = [bins];
  const columns = Object.keys(bins).sort((a, b) => {
    // Sort numeric values properly
    const aNum = parseInt(a, 10);
    const bNum = parseInt(b, 10);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    // Put blank/unknown at the end
    if (a === blankLabel) return 1;
    if (b === blankLabel) return -1;
    return a.localeCompare(b);
  });

  const percentages = roundPercentages(columns.map((column) => bins[column]));

  const statusColorById = createColorMap(columns);

  const legendItems = columns.map((column) => {
    return {
      icon: 'circle' as const,
      color: statusColorById[column],
      label: column,
      value: bins[column],
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
      label: truncate(labels[i], 50),
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
