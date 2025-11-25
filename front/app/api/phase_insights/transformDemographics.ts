import { transformDemographicsToChartRows } from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/DemographicsWidget/utils';

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
 * Uses shared transformation utilities for consistency with Report Builder.
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
  // Get localized field name
  const field_name = getLocalizedLabel(
    field.field_name_multiloc,
    currentLocale,
    field.field_key
  );

  // Use shared transformation utility to convert series/options to chart rows
  const chartRows = transformDemographicsToChartRows(
    field,
    field.field_code ?? undefined,
    '_blank', // We'll handle blank label in the next step
    (key, multiloc) => getLocalizedLabel(multiloc, currentLocale, key)
  );

  // Convert chart rows to data_points format
  const data_points: DemographicDataPoint[] = chartRows.map((row) => ({
    key: row.category, // Using category as key (not ideal, but preserves behavior)
    label: row.category,
    count: row.count,
    percentage: row.participants,
    population_percentage: row.population,
  }));

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
