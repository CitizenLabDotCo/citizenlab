import { roundPercentages } from 'utils/math';

import {
  DemographicDataPoint,
  DemographicField,
  DemographicFieldBackend,
  PhaseInsightsDemographics,
} from './types';

/**
 * Transforms backend demographics attributes (series/options format)
 * into frontend format (data_points array) for component consumption.
 *
 * This follows the established pattern from Report Builder but outputs
 * a simpler structure suitable for phase insights visualizations.
 */
export const transformDemographicsResponse = (
  attributes: { fields: DemographicFieldBackend[] },
  currentLocale: string
): PhaseInsightsDemographics => {
  return {
    fields: attributes.fields.map((field) =>
      transformField(field, currentLocale)
    ),
  };
};

/**
 * Transforms a single demographic field from backend to frontend format
 */
const transformField = (
  field: DemographicFieldBackend,
  currentLocale: string
): DemographicField => {
  // Calculate total population if available
  const populationTotal = field.population_distribution
    ? Object.values(field.population_distribution).reduce(
        (sum, count) => sum + count,
        0
      )
    : 0;

  // Extract counts array in order for percentage calculation
  const keys = Object.keys(field.series);
  const counts = keys.map((key) => field.series[key]);

  // Use roundPercentages utility to ensure percentages sum to 100
  const percentages = roundPercentages(counts, 1); // 1 decimal place

  // Convert series + options into data_points array with ordering
  const dataPointsWithOrdering = keys.map((key, index) => {
    const option = field.options?.[key];
    const count = field.series[key];
    const percentage = percentages[index];

    // Calculate population percentage if available
    let population_percentage: number | undefined;
    if (field.population_distribution?.[key] !== undefined) {
      const popCount = field.population_distribution[key];
      population_percentage =
        populationTotal > 0 ? (popCount / populationTotal) * 100 : 0;
      // Round to 1 decimal place
      population_percentage = Math.round(population_percentage * 10) / 10;
    }

    // Get localized label from multiloc
    const label = getLocalizedLabel(option?.title_multiloc, currentLocale, key);

    return {
      key,
      label,
      count,
      percentage,
      population_percentage,
      ordering: option?.ordering ?? 999, // Use high number for items without ordering
    };
  });

  // Sort by ordering field
  const sortedDataPoints = dataPointsWithOrdering.sort(
    (a, b) => a.ordering - b.ordering
  );

  // Remove ordering from final output
  const data_points: DemographicDataPoint[] = sortedDataPoints.map(
    ({ ordering: _ordering, ...rest }) => rest
  );

  // Get localized field name
  const field_name = getLocalizedLabel(
    field.field_name_multiloc,
    currentLocale,
    field.field_key
  );

  return {
    field_id: field.field_id,
    field_key: field.field_key,
    field_name,
    field_code: field.field_code,
    data_points,
    r_score: field.r_score,
  };
};

/**
 * Extracts localized label from multiloc object
 * Falls back to English, then to the key itself
 */
const getLocalizedLabel = (
  multiloc: Record<string, string> | undefined,
  currentLocale: string,
  fallbackKey: string
): string => {
  if (!multiloc) {
    return fallbackKey;
  }

  // Try current locale
  if (multiloc[currentLocale]) {
    return multiloc[currentLocale];
  }

  // Try English fallback
  if (multiloc['en']) {
    return multiloc['en'];
  }

  // Try first available locale
  const firstLocale = Object.keys(multiloc)[0];
  if (firstLocale && multiloc[firstLocale]) {
    return multiloc[firstLocale];
  }

  // Final fallback to key
  return fallbackKey;
};
