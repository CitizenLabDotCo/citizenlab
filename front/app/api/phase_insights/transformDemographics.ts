import { Localize } from 'hooks/useLocalize';

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
  localize: Localize
): PhaseInsightsDemographics => {
  return {
    fields: attributes.fields.map((field) => transformField(field, localize)),
  };
};

/**
 * Transforms a single demographic field from backend to frontend format
 */
const transformField = (
  field: DemographicFieldBackend,
  localize: Localize
): DemographicField => {
  // Get localized field name
  const field_name = localize(field.field_name_multiloc);

  // Use shared transformation utility to convert series/options to chart rows
  const chartRows = transformDemographicsToChartRows(
    field,
    field.field_code ?? undefined,
    '_blank',
    (_key, multiloc) => localize(multiloc)
  );

  // Convert chart rows to data_points format
  const data_points: DemographicDataPoint[] = chartRows.map((row) => ({
    key: row.category,
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
