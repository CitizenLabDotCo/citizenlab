import { XlsxData } from 'components/admin/ReportExportMenu';
import { StatCardChartData } from './typings';

export const parseExcelData = (data: StatCardChartData): XlsxData => {
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
