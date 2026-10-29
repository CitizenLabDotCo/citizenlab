import { ReportResponse } from 'api/reports/types';
import useDeleteReport from 'api/reports/useDeleteReport';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const useConfirmDeleteReport = () => {
  const { formatMessage } = useIntl();
  const { mutate: deleteReport, isPending } = useDeleteReport();

  const confirmDelete = (report: ReportResponse) => {
    const reportName = report.data.attributes.name;

    const message = reportName
      ? formatMessage(messages.confirmDeleteReport, { reportName })
      : formatMessage(messages.confirmDeleteThisReport);

    if (window.confirm(message)) deleteReport(report.data.id);
  };

  return { confirmDelete, isDeleting: isPending };
};

export default useConfirmDeleteReport;
