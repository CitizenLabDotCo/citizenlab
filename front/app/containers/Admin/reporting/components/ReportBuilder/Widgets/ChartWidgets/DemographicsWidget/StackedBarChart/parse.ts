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

/**
 * Processes raw number field data by grouping numeric values into bins.
 * This is crucial for creating readable distributions for bar/column charts.
 * The function dynamically selects one of three binning strategies based on the data's range:
 *
 * 1. Individual Bins: If the data range is small (<= 10) AND the number of unique
 * values is low (<= 20). Creates a bin for every single unique number (e.g., "1", "2").
 *
 * 2. Fixed Bin Size: If the data range is medium (<= 50, but > 10). Uses a
 * standardized, fixed bin size of 5 (e.g., "1-5", "6-10").
 *
 * 3. Dynamic/Calculated Bins: If the data range is large (> 50). Calculates a
 * dynamic bin size to target between 5 and 7 total bins, ensuring the chart
 * is legible and trends are clear, even with extreme data spread.
 *
 * All strategies include a separate category for blank responses.
 */
export const parseNumberFieldResponse = (
  series: DemographicsResponse['data']['attributes']['series'],
  blankLabel: string
) => {
  // For number fields, create bins based on the actual values
  const numericKeys = Object.keys(series).filter((key) => key !== '_blank');
  const numericValues = numericKeys
    .map(Number)
    .filter((numericKey) => !isNaN(numericKey));

  if (numericValues.length === 0) {
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
  const minimumValue = Math.min(...numericValues);
  const maximumValue = Math.max(...numericValues);
  const dataRange = maximumValue - minimumValue;
  const dataBins: Record<string, number> = {};

  // Determine binning strategy based on data characteristics
  if (dataRange <= 10 && numericValues.length <= 20) {
    // Small range with few unique values: create individual bins
    for (
      let currentValue = minimumValue;
      currentValue <= maximumValue;
      currentValue++
    ) {
      const key = currentValue.toString();
      dataBins[key] = series[key] || 0;
    }
  } else if (dataRange <= 50) {
    // Medium range: create bins of size 5
    const binSize = 5;
    for (
      let binStartValue = minimumValue;
      binStartValue <= maximumValue;
      binStartValue += binSize
    ) {
      const binEndValue = Math.min(binStartValue + binSize - 1, maximumValue);
      const binKey = `${binStartValue}-${binEndValue}`;
      dataBins[binKey] = 0;

      // Sum values in this range
      for (
        let valueToSum = binStartValue;
        valueToSum <= binEndValue;
        valueToSum++
      ) {
        dataBins[binKey] += series[valueToSum.toString()] || 0;
      }
    }
  } else {
    // Large range: create ~5-7 bins
    const recommendedNumBins = Math.min(
      7,
      Math.max(5, Math.ceil(numericValues.length / 10))
    );
    const calculatedBinSize = Math.ceil(dataRange / recommendedNumBins);

    for (
      let binStartValue = minimumValue;
      binStartValue <= maximumValue;
      binStartValue += calculatedBinSize
    ) {
      const binEndValue = Math.min(
        binStartValue + calculatedBinSize - 1,
        maximumValue
      );
      const binKey =
        calculatedBinSize === 1
          ? binStartValue.toString()
          : `${binStartValue}-${binEndValue}`;
      dataBins[binKey] = 0;

      // Sum values in this range
      for (
        let valueToSum = binStartValue;
        valueToSum <= binEndValue;
        valueToSum++
      ) {
        dataBins[binKey] += series[valueToSum.toString()] || 0;
      }
    }
  }

  // Add unknown/blank values
  if (series._blank) {
    dataBins[blankLabel] = series._blank;
  }

  const data: [Record<string, number>] = [dataBins];
  const columns = Object.keys(dataBins).sort((a, b) => {
    // Sort numeric values properly
    const aNumericValue = parseInt(a, 10);
    const bNumericValue = parseInt(b, 10);
    if (!isNaN(aNumericValue) && !isNaN(bNumericValue)) {
      return aNumericValue - bNumericValue;
    }
    // Put blank/unknown at the end
    if (a === blankLabel) return 1;
    if (b === blankLabel) return -1;
    return a.localeCompare(b);
  });

  const percentages = roundPercentages(
    columns.map((column) => dataBins[column])
  );

  const statusColorById = createColorMap(columns);

  const legendItems = columns.map((column) => {
    return {
      icon: 'circle' as const,
      color: statusColorById[column],
      label: column,
      value: dataBins[column],
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
