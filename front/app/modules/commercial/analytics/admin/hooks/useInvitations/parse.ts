import { XlsxData } from 'components/admin/ReportExportMenu';
import { InvitationsChartData } from './typings';
import { formatCountValue } from '../../utils/parse';

export const parseInvitationsChartData = (
  all,
  allPeriod,
  successful,
  successfulPeriod
): InvitationsChartData => {
  return {
    totalInvites: {
      value: formatCountValue(all[0].count),
      lastPeriod: formatCountValue(allPeriod[0].count),
    },
    pendingInvites: {
      value: formatCountValue(successful[0].count),
      lastPeriod: formatCountValue(successfulPeriod[0].count),
    },
  };
};

export const parseInvitationsExcelData = (
  all,
  allPeriod,
  successful,
  successfulPeriod,
  labels
): XlsxData => {
  const data = parseInvitationsChartData(
    all,
    allPeriod,
    successful,
    successfulPeriod
  );

  const xlsxDataSheet1 = {
    [labels.total]: data.totalInvites.value,
    [`${labels.total}_${labels.period}`]: data.totalInvites.lastPeriod,
    [`${labels.successful}`]: data.pendingInvites.value,
    [`${labels.successful}_${labels.period}`]: data.pendingInvites.lastPeriod,
  };

  const xlsxData = {
    [labels.cardTitle]: [xlsxDataSheet1],
  };

  return xlsxData;
};
