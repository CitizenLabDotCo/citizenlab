import { XlsxData } from 'components/admin/ReportExportMenu';
import { ProposalsChartData } from './typings';
import { formatCountValue } from '../../utils/parse';

export const parseProposalsChartData = (
  all,
  allPeriod,
  successful,
  successfulPeriod
): ProposalsChartData => {
  return {
    totalProposals: {
      value: formatCountValue(all[0].count),
      lastPeriod: formatCountValue(allPeriod[0].count),
    },
    successfulProposals: {
      value: formatCountValue(successful[0].count),
      lastPeriod: formatCountValue(successfulPeriod[0].count),
    },
  };
};

export const parseProposalsExcelData = (
  all,
  allPeriod,
  successful,
  successfulPeriod,
  labels
): XlsxData => {
  const data = parseProposalsChartData(
    all,
    allPeriod,
    successful,
    successfulPeriod
  );

  const xlsxDataSheet1 = {
    [labels.total]: data.totalProposals.value,
    [`${labels.total}_${labels.period}`]: data.totalProposals.lastPeriod,
    [`${labels.successful}`]: data.successfulProposals.value,
    [`${labels.successful}_${labels.period}`]:
      data.successfulProposals.lastPeriod,
  };

  const xlsxData = {
    [labels.cardTitle]: [xlsxDataSheet1],
  };

  return xlsxData;
};
