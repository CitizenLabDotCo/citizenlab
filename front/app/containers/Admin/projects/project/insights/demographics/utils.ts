import { MessageDescriptor } from 'react-intl';

import { DemographicField } from 'api/phase_insights/types';

import { DemographicChartRow } from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/DemographicsWidget/utils';

import { XlsxData } from 'components/admin/ReportExportMenu';

import messages from '../messages';

type FormatMessage = (descriptor: MessageDescriptor) => string;

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
export const toExcelData = (
  field: DemographicField,
  formatMessage: FormatMessage
): XlsxData => {
  const sheetName = field.field_name;
  const rows = field.data_points.map((point) => ({
    [formatMessage(messages.category)]: point.label,
    [formatMessage(messages.participantsPercent)]: point.percentage,
    [formatMessage(messages.populationPercent)]:
      point.population_percentage ?? '-',
    [formatMessage(messages.count)]: point.count,
  }));

  return { [sheetName]: rows };
};
