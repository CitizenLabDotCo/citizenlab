import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

import useCopyReport from 'api/reports/useCopyReport';
import useDeleteReport from 'api/reports/useDeleteReport';
import useReport from 'api/reports/useReport';

import Button from 'components/UI/Button';

import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  reportId: string;
  showDuplicate?: boolean;
}

const Buttons = ({ reportId, showDuplicate = true }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: duplicateReport, isLoading: isDuplicating } = useCopyReport();
  const { mutate: deleteReport, isLoading: isDeleting } = useDeleteReport();
  const { data: report } = useReport(reportId);
  if (!report) return null;

  const isLoading = isDuplicating || isDeleting;
  const canEdit =
    report.data.attributes.action_descriptor.editing_report.enabled;

  const handleDeleteReport = async () => {
    const reportName = report.data.attributes.name;

    const message = reportName
      ? formatMessage(messages.confirmDeleteReport, { reportName })
      : formatMessage(messages.confirmDeleteThisReport);

    if (window.confirm(message)) deleteReport(report.data.id);
  };

  return (
    <>
      <Button
        id="e2e-delete-report-button"
        mr="8px"
        icon="delete"
        buttonStyle="white"
        textColor={colors.textSecondary}
        onClick={handleDeleteReport}
        processing={isDeleting}
        disabled={isLoading || !canEdit}
        iconSize="18px"
      >
        {formatMessage(messages.delete)}
      </Button>

      {showDuplicate && (
        <Button
          mr="8px"
          icon="copy"
          buttonStyle="secondary"
          processing={isDuplicating}
          disabled={isLoading || !canEdit}
          iconSize="18px"
          onClick={() => duplicateReport({ id: reportId })}
        >
          {formatMessage(messages.duplicate)}
        </Button>
      )}

      <Tippy
        disabled={canEdit}
        interactive={true}
        placement="bottom"
        content={formatMessage(messages.cannotEditReport)}
      >
        <div>
          <Button
            mr="8px"
            icon="edit"
            buttonStyle="secondary"
            disabled={isLoading || !canEdit}
            iconSize="18px"
            linkTo={`/admin/reporting/report-builder/${reportId}/editor`}
          >
            {formatMessage(messages.edit)}
          </Button>
        </div>
      </Tippy>
    </>
  );
};

export default Buttons;
