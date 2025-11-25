import { DemographicsResponse } from 'api/graph_data_units/responseTypes/DemographicsWidget';

import { Localize } from 'hooks/useLocalize';

import { binAge } from 'utils/dataUtils';
import { roundPercentages } from 'utils/math';

export interface DemographicChartRow {
  category: string;
  participants: number;
  population?: number;
  count: number;
}

/**
 * Convert Report Builder demographics response to ComparisonBarChart format
 */
export const toChartData = (
  response: DemographicsResponse,
  localize: Localize,
  blankLabel: string,
  customFieldCode?: string
): DemographicChartRow[] => {
  const { series, options, population_distribution } = response.data.attributes;

  // Check if this is birthyear data specifically (not just any field without options)
  const isBirthyearData =
    options === undefined && customFieldCode === 'birthyear';

  if (isBirthyearData) {
    return parseBirthyearData(series, blankLabel, population_distribution);
  }

  // If options is undefined but it's not birthyear, it's likely a number field
  // For now, we'll just return empty array or handle it differently
  if (options === undefined) {
    // This could be a number field like household_size, etc.
    // For now, return empty to avoid incorrect binning
    return [];
  }

  return parseOtherData(
    series,
    options,
    localize,
    blankLabel,
    population_distribution
  );
};

/**
 * Parse birthyear data with age binning
 */
const parseBirthyearData = (
  series: DemographicsResponse['data']['attributes']['series'],
  blankLabel: string,
  population_distribution?: DemographicsResponse['data']['attributes']['population_distribution']
): DemographicChartRow[] => {
  const bins = binAge(series, {
    missingBin: blankLabel,
  });

  // Calculate percentages
  const values = bins.map((bin) => bin.value);
  const percentages = roundPercentages(values);

  // Bin population data if available (using same keys as participant bins)
  let populationPercentages: (number | undefined)[] | undefined;
  if (population_distribution) {
    const populationBins = binAge(population_distribution, {
      missingBin: blankLabel,
    });
    const populationValues = populationBins.map((bin) => bin.value);
    populationPercentages = roundPercentages(populationValues);
  }

  // Convert to chart row format
  return bins.map((bin, index) => ({
    category: bin.name,
    participants: percentages[index],
    population: populationPercentages?.[index],
    count: bin.value,
  }));
};

/**
 * Parse other demographic data (gender, domicile, etc.)
 */
const parseOtherData = (
  series: DemographicsResponse['data']['attributes']['series'],
  options: Record<string, { title_multiloc: any; ordering: number }>,
  localize: Localize,
  blankLabel: string,
  population_distribution?: DemographicsResponse['data']['attributes']['population_distribution']
): DemographicChartRow[] => {
  // Sort columns by ordering
  const columnsWithoutBlank = Object.keys(options).sort(
    (a, b) => options[a].ordering - options[b].ordering
  );

  // Add blank column if it exists in series
  const hasBlank = (series['_blank'] ?? 0) > 0;
  const columns = hasBlank
    ? [...columnsWithoutBlank, '_blank']
    : columnsWithoutBlank;

  // Calculate percentages
  const values = columns.map((column) => series[column] || 0);
  const percentages = roundPercentages(values);

  // Calculate population percentages if available
  let populationPercentages: (number | undefined)[] | undefined;
  if (population_distribution) {
    const populationValues = columns.map(
      (column) => population_distribution[column] || 0
    );
    populationPercentages = roundPercentages(populationValues);
  }

  // Convert to chart row format
  return columns.map((column, index) => {
    const category =
      column === '_blank'
        ? blankLabel
        : localize(options[column].title_multiloc);

    return {
      category,
      participants: percentages[index],
      population: populationPercentages?.[index],
      count: series[column] || 0,
    };
  });
};
