import { XlsxData } from 'components/admin/ReportExportMenu';
import { StatCardChartData } from './typings';

export const parseExcelData = (data: StatCardChartData): XlsxData => {
  const xlsxDataSheet = {};
  data.stats.forEach((stat) => {
    xlsxDataSheet[stat.label] = stat.value;
    stat.lastPeriod &&
      (xlsxDataSheet[`${stat.label}_${data.periodLabel}`] = stat.lastPeriod);
  });

  const xlsxData = {
    [data.cardTitle]: [xlsxDataSheet],
  };

  return xlsxData;
};
