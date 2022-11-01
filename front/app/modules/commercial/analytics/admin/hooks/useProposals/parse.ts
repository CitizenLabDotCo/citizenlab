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
  resolution
): XlsxData => {
  const data = parseChartData(all, allPeriod, successful, successfulPeriod);
  // TODO: Get translations
  // statusChanged: formatMessage(messages.statusChanged),
  //   officialUpdate: formatMessage(messages.officialUpdate),
  //   feedbackGiven: formatMessage(messages.feedbackGiven),

  // const BOTTOM_LABEL_COPY: Record<IResolution, MessageDescriptor> = {
  //   month: messages.last30Days,
  //   week: messages.last7Days,
  //   day: messages.yesterday,
  // };

  const xlsxDataSheet1 = {
    ['All proposals']: data.totalProposals.value,
    [`All proposals ${resolution}`]: data.totalProposals.lastPeriod,
    ['Successful proposals']: data.successfulProposals.value,
    [`Successful proposals ${resolution}`]: data.successfulProposals.lastPeriod,
  };

  const xlsxData = {
    ['Proposals']: [xlsxDataSheet1],
  };

  console.log(all, allPeriod, successful, successfulPeriod);

  return xlsxData;
};
