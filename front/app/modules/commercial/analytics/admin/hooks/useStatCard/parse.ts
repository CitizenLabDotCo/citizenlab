import { XlsxData } from 'components/admin/ReportExportMenu';
import { StatCardData, StatCardLabels } from './typings';
import { getTimePeriodTranslationByResolution } from '../../utils/resolution';
import { FormatMessage } from '../../../../../../typings';
import { IResolution } from '../../../../../../components/admin/ResolutionControl';
import { MessageDescriptor } from 'react-intl';

export const parseExcelData = (data: StatCardData): XlsxData => {
  const xlsxDataSheet = {};
  data.stats.forEach((stat) => {
    const label = underscoreCase(stat.label);
    xlsxDataSheet[label] = stat.value;
    stat.lastPeriod &&
      (xlsxDataSheet[`${label}_${underscoreCase(data.periodLabel)}`] =
        stat.lastPeriod);
  });

  const xlsxData = {
    [data.cardTitle]: [xlsxDataSheet],
  };

  return xlsxData;
};

export const underscoreCase = (label: string | undefined): string => {
  if (label) {
    return label.toLowerCase().replaceAll(' ', '_').replaceAll(':', '');
  }
  return '';
};

export const formatLabels = (
  messages: Record<string, MessageDescriptor>,
  formatMessage: FormatMessage,
  resolution: IResolution
): StatCardLabels => {
  const labels = {
    periodLabel: getTimePeriodTranslationByResolution(
      formatMessage,
      resolution
    ),
  };
  Object.entries(messages).forEach(([name, value]) => {
    labels[name] = formatMessage(value);
  });
  return labels;
};
