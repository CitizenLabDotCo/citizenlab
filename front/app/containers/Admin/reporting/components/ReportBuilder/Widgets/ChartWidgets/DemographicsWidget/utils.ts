import { DemographicsResponse } from 'api/graph_data_units/responseTypes/DemographicsWidget';

import { Localize } from 'hooks/useLocalize';

import { binAge } from 'utils/dataUtils';
import { roundPercentages } from 'utils/math';

export interface DemographicsSeriesData {
  series: Record<string, number>;
  options?: Record<
    string,
    {
      title_multiloc: Record<string, string>;
      ordering: number;
    }
  >;
  population_distribution?: Record<string, number>;
}

export interface DemographicChartRow {
  category: string;
  participants: number;
  population?: number;
  count: number;
}

const BLANK_KEY = '_blank';

export const transformDemographicsToChartRows = (
  data: DemographicsSeriesData,
  customFieldCode: string | undefined,
  blankLabel: string,
  localizeOption: (key: string, multiloc?: Record<string, string>) => string
): DemographicChartRow[] => {
  const { series, options, population_distribution } = data;

  // Special handling for birthyear: bin ages into ranges
  const isBirthyearData =
    options === undefined && customFieldCode === 'birthyear';

  if (isBirthyearData) {
    return transformBirthyearData(series, blankLabel, population_distribution);
  }

  if (options === undefined) {
    return [];
  }

  return transformSelectFieldData(
    series,
    options,
    blankLabel,
    localizeOption,
    population_distribution
  );
};

/**
 * Checks if the series contains individual birth years (e.g., "1990", "1985")
 * vs pre-binned age ranges (e.g., "15-19", "20-24", "85+")
 */
const isIndividualBirthYears = (series: Record<string, number>): boolean => {
  const keys = Object.keys(series).filter((key) => key !== BLANK_KEY);
  // Individual birth years are 4-digit numbers (e.g., "1990")
  // Pre-binned ranges contain "-" or "+" (e.g., "15-19", "85+")
  return keys.length > 0 && keys.every((key) => /^\d{4}$/.test(key));
};

/**
 * Transforms birthyear data into chart rows.
 * Handles two formats:
 * 1. Individual birth years (e.g., "1990", "1985") - needs binning via binAge
 * 2. Pre-binned age ranges (e.g., "15-19", "20-24") - used directly
 */
const transformBirthyearData = (
  series: Record<string, number>,
  blankLabel: string,
  populationDistribution?: Record<string, number>
): DemographicChartRow[] => {
  if (isIndividualBirthYears(series)) {
    return transformIndividualBirthYears(
      series,
      blankLabel,
      populationDistribution
    );
  }
  return transformPreBinnedAgeRanges(
    series,
    blankLabel,
    populationDistribution
  );
};

/**
 * Transforms individual birth years using binAge to group into age ranges.
 */
const transformIndividualBirthYears = (
  series: Record<string, number>,
  blankLabel: string,
  populationDistribution?: Record<string, number>
): DemographicChartRow[] => {
  const bins = binAge(series, { missingBin: blankLabel });
  const values = bins.map((bin) => bin.value);
  const percentages = roundPercentages(values);

  let populationPercentages: number[] | undefined;
  if (populationDistribution) {
    const populationBins = binAge(populationDistribution, {
      missingBin: blankLabel,
    });
    populationPercentages = roundPercentages(
      populationBins.map((bin) => bin.value)
    );
  }

  return bins.map((bin, index) => ({
    category: bin.name,
    participants: percentages[index],
    population: populationPercentages?.[index],
    count: bin.value,
  }));
};

const transformPreBinnedAgeRanges = (
  series: Record<string, number>,
  blankLabel: string,
  populationDistribution?: Record<string, number>
): DemographicChartRow[] => {
  const keys = Object.keys(series).filter((key) => key !== BLANK_KEY);

  const hasBlank = (series[BLANK_KEY] ?? 0) > 0;
  if (hasBlank) {
    keys.push(BLANK_KEY);
  }

  return buildChartRows(keys, series, blankLabel, populationDistribution);
};

const transformSelectFieldData = (
  series: Record<string, number>,
  options: Record<
    string,
    {
      title_multiloc: Record<string, string>;
      ordering: number;
    }
  >,
  blankLabel: string,
  localizeOption: (key: string, multiloc?: Record<string, string>) => string,
  populationDistribution?: Record<string, number>
): DemographicChartRow[] => {
  const sortedKeys = Object.keys(options).sort(
    (a, b) => options[a].ordering - options[b].ordering
  );

  const hasBlank = (series[BLANK_KEY] ?? 0) > 0;
  const keys = hasBlank ? [...sortedKeys, BLANK_KEY] : sortedKeys;

  const getCategoryLabel = (key: string) =>
    key === BLANK_KEY
      ? blankLabel
      : localizeOption(key, options[key].title_multiloc);

  return buildChartRows(
    keys,
    series,
    blankLabel,
    populationDistribution,
    getCategoryLabel
  );
};

/**
 * Builds chart rows from series data with percentages and optional population comparison.
 */
const buildChartRows = (
  keys: string[],
  series: Record<string, number>,
  blankLabel: string,
  populationDistribution?: Record<string, number>,
  getCategoryLabel?: (key: string) => string
): DemographicChartRow[] => {
  const values = keys.map((key) => series[key] ?? 0);
  const percentages = roundPercentages(values);

  const populationPercentages = populationDistribution
    ? roundPercentages(keys.map((key) => populationDistribution[key] ?? 0))
    : undefined;

  return keys.map((key, index) => ({
    category: getCategoryLabel
      ? getCategoryLabel(key)
      : key === BLANK_KEY
      ? blankLabel
      : key,
    participants: percentages[index],
    population: populationPercentages?.[index],
    count: series[key] ?? 0,
  }));
};

export const transformReportBuilderDemographics = (
  response: DemographicsResponse,
  localize: Localize,
  blankLabel: string,
  customFieldCode?: string
): DemographicChartRow[] => {
  return transformDemographicsToChartRows(
    response.data.attributes,
    customFieldCode,
    blankLabel,
    (_key, multiloc) => (multiloc ? localize(multiloc) : _key)
  );
};
