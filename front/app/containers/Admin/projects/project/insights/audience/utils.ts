import { DemographicField } from 'api/phase_insights/types';

import { DemographicChartRow } from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/DemographicsWidget/utils';

import { XlsxData } from 'components/admin/ReportExportMenu';

/**
 * Convert DemographicField data to chart row format
 */
export const toChartData = (field: DemographicField): DemographicChartRow[] => {
  return field.data_points.map((point) => ({
    category: point.label,
    participants: point.percentage,
    population: point.population_percentage,
    count: point.count,
  }));
};

/**
 * Generate Excel export data from DemographicField
 */
export const toExcelData = (field: DemographicField): XlsxData => {
  const sheetName = field.field_name;
  const rows = field.data_points.map((point) => ({
    Category: point.label,
    'Participants (%)': point.percentage,
    'Population (%)': point.population_percentage ?? '-',
    Count: point.count,
  }));

  return { [sheetName]: rows };
};
