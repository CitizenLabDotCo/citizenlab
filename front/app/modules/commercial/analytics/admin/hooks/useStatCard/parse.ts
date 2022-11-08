import { XlsxData } from 'components/admin/ReportExportMenu';
import { StatCardChartData } from './typings';

export const parseExcelData = (data: StatCardChartData): XlsxData => {
  // const xlsxDataSheet1 = {
  //   [labels.total]: data.totalInvites.value,
  //   [`${labels.total}_${labels.period}`]: data.totalInvites.lastPeriod,
  //   [`${labels.pending}`]: data.pendingInvites.value,
  //   [`${labels.accepted}`]: data.acceptedInvites.value,
  //   [`${labels.accepted}_${labels.period}`]: data.acceptedInvites.lastPeriod,
  // };

  const xlsxDataSheet = {
    ['hello']: 'something',
  };

  const xlsxData = {
    [data.cardTitle]: [xlsxDataSheet],
  };

  return xlsxData;
};
