import { Localize } from 'hooks/useLocalize';

import { transformDemographicsToChartRows } from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/DemographicsWidget/utils';

import {
  DemographicDataPoint,
  DemographicField,
  DemographicFieldBackend,
  PhaseInsightsDemographics,
} from './types';

export const transformDemographicsResponse = (
  attributes: { fields: DemographicFieldBackend[] },
  localize: Localize,
  blankLabel: string
): PhaseInsightsDemographics => {
  return {
    fields: attributes.fields.map((field) =>
      transformField(field, localize, blankLabel)
    ),
  };
};

const transformField = (
  field: DemographicFieldBackend,
  localize: Localize,
  blankLabel: string
): DemographicField => {
  const field_name = localize(field.title_multiloc);
  const seriesData = {
    series: field.series,
    options: field.options,
    population_distribution: field.reference_distribution,
  };

  const chartRows = transformDemographicsToChartRows(
    seriesData,
    field.code ?? undefined,
    blankLabel,
    (_key, multiloc) => localize(multiloc)
  );

  const data_points: DemographicDataPoint[] = chartRows.map((row) => ({
    key: row.category,
    label: row.category,
    count: row.count,
    percentage: row.participants,
    population_percentage: row.population,
  }));

  return {
    field_id: field.id,
    field_key: field.key,
    field_name,
    field_code: field.code,
    data_points,
    r_score:
      typeof field.r_score === 'number'
        ? Math.round(field.r_score * 100)
        : undefined,
  };
};
