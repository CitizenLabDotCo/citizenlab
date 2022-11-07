import { XlsxData } from 'components/admin/ReportExportMenu';
import { InvitationsChartData } from './typings';
import { formatCountValue } from '../../utils/parse';

export const parseInvitationsChartData = (
  total,
  totalPeriod,
  pending,
  accepted,
  acceptedPeriod
): InvitationsChartData => {
  return {
    totalInvites: {
      value: formatCountValue(total[0].count),
      lastPeriod: formatCountValue(totalPeriod[0].count),
    },
    pendingInvites: {
      value: formatCountValue(pending[0].count),
    },
    acceptedInvites: {
      value: formatCountValue(accepted[0].count),
      lastPeriod: formatCountValue(acceptedPeriod[0].count),
    },
  };
};

export const parseInvitationsExcelData = (
  total,
  totalPeriod,
  pending,
  accepted,
  acceptedPeriod,
  labels
): XlsxData => {
  const data = parseInvitationsChartData(
    total,
    totalPeriod,
    pending,
    accepted,
    acceptedPeriod
  );

  const xlsxDataSheet1 = {
    [labels.total]: data.totalInvites.value,
    [`${labels.total}_${labels.period}`]: data.totalInvites.lastPeriod,
    [`${labels.pending}`]: data.pendingInvites.value,
    [`${labels.accepted}`]: data.acceptedInvites.value,
    [`${labels.accepted}_${labels.period}`]: data.acceptedInvites.lastPeriod,
  };

  const xlsxData = {
    [labels.cardTitle]: [xlsxDataSheet1],
  };

  return xlsxData;
};
