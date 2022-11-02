import { XlsxData } from 'components/admin/ReportExportMenu';
import { ChartData } from './typings';

// TODO: Could we process all the messages in here and pass them back in the data object
// Separate function to get all labels in this file

export const parseChartData = (
  all,
  allPeriod,
  successful,
  successfulPeriod
): ChartData => {
  return {
    totalProposals: {
      value: all[0].count,
      lastPeriod: allPeriod[0].count,
    },
    successfulProposals: {
      value: successful[0].count,
      lastPeriod: successfulPeriod[0].count,
    },
  };
};

export const parseExcelData = (
  all,
  allPeriod,
  successful,
  successfulPeriod,
  labels
): XlsxData => {
  const data = parseChartData(all, allPeriod, successful, successfulPeriod);

  const xlsxDataSheet1 = {
    [labels.total]: data.totalProposals.value,
    [`${labels.total}:${labels.period}`]: data.totalProposals.lastPeriod,
    [`${labels.successful}:${labels.period}`]: data.successfulProposals.value,
    [`${labels.successful}:${labels.period}`]:
      data.successfulProposals.lastPeriod,
  };

  const xlsxData = {
    [labels.cardTitle]: [xlsxDataSheet1],
  };

  return xlsxData;
};
