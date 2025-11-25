import { binAge } from './dataUtils';
import { roundPercentages } from './math';

/**
 * Shared utilities for transforming demographics data from backend format
 * (series/options) to frontend chart format.
 *
 * Used by:
 * - Report Builder DemographicsWidget
 * - Phase Insights DemographicsSection
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Backend format (series/options pattern)
 */
export interface DemographicsSeriesData {
  series: Record<string, number>; // { "male": 680, "female": 830, "_blank": 10 }
  options?: Record<
    string,
    {
      title_multiloc: Record<string, string>;
      ordering: number;
    }
  >;
  population_distribution?: Record<string, number>;
}

/**
 * Chart row format for ComparisonBarChart
 */
export interface DemographicChartRow {
  category: string;
  participants: number;
  population?: number;
  count: number;
}

// ============================================================================
// Main Transformer
// ============================================================================

/**
 * Transform demographics data from backend series/options format to chart rows
 *
 * @param data - Backend series data with optional options and population
 * @param customFieldCode - Field code (e.g., 'birthyear', 'gender') for special handling
 * @param blankLabel - Label to use for blank/unknown values
 * @param localizeOption - Function to localize option labels (key, multiloc) => string
 * @returns Array of chart rows ready for ComparisonBarChart
 */
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

  // If options is undefined but it's not birthyear, it's an unsupported number field
  if (options === undefined) {
    return [];
  }

  // Standard select field: transform with options
  return transformSelectFieldData(
    series,
    options,
    blankLabel,
    localizeOption,
    population_distribution
  );
};

// ============================================================================
// Birthyear-Specific Transformation
// ============================================================================

/**
 * Transform birthyear data by binning ages into ranges
 */
const transformBirthyearData = (
  series: Record<string, number>,
  blankLabel: string,
  population_distribution?: Record<string, number>
): DemographicChartRow[] => {
  // Bin participant ages
  const bins = binAge(series, {
    missingBin: blankLabel,
  });

  const values = bins.map((bin) => bin.value);
  const percentages = roundPercentages(values);

  // Bin population ages if available
  let populationPercentages: (number | undefined)[] | undefined;
  if (population_distribution) {
    const populationBins = binAge(population_distribution, {
      missingBin: blankLabel,
    });
    const populationValues = populationBins.map((bin) => bin.value);
    populationPercentages = roundPercentages(populationValues);
  }

  return bins.map((bin, index) => ({
    category: bin.name,
    participants: percentages[index],
    population: populationPercentages?.[index],
    count: bin.value,
  }));
};

// ============================================================================
// Select Field Transformation
// ============================================================================

/**
 * Transform select field data with options metadata
 */
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
  population_distribution?: Record<string, number>
): DemographicChartRow[] => {
  // Sort option keys by ordering
  const columnsWithoutBlank = Object.keys(options).sort(
    (a, b) => options[a].ordering - options[b].ordering
  );

  // Add blank column if it has data
  const hasBlank = (series['_blank'] ?? 0) > 0;
  const columns = hasBlank
    ? [...columnsWithoutBlank, '_blank']
    : columnsWithoutBlank;

  // Calculate participant percentages
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

  // Map to chart rows
  return columns.map((column, index) => {
    const category =
      column === '_blank'
        ? blankLabel
        : localizeOption(column, options[column].title_multiloc);

    return {
      category,
      participants: percentages[index],
      population: populationPercentages?.[index],
      count: series[column] || 0,
    };
  });
};
