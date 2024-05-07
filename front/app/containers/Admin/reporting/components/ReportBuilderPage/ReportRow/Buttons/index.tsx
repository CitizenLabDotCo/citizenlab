import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

import useCopyReport from 'api/reports/useCopyReport';
import useDeleteReport from 'api/reports/useDeleteReport';
import useReport from 'api/reports/useReport';

import Button from 'components/UI/Button';

import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

const BaseButton = (props) => {
  // hard-coded values come after the spread operator to override the prop values
  return <Button {...props} mr={'8px'} iconSize={'18px'} />;
};

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
      <BaseButton
        id="e2e-delete-report-button"
        icon="delete"
        buttonStyle="white"
        textColor={colors.textSecondary}
        onClick={handleDeleteReport}
        processing={isDeleting}
        disabled={isLoading || !canEdit}
      >
        {formatMessage(messages.delete)}
      </BaseButton>

      {showDuplicate && (
        <BaseButton
          icon="copy"
          buttonStyle="secondary"
          processing={isDuplicating}
          disabled={isLoading || !canEdit}
          onClick={() => duplicateReport({ id: reportId })}
        >
          {formatMessage(messages.duplicate)}
        </BaseButton>
      )}

      <Tippy
        disabled={canEdit}
        interactive={true}
        placement="bottom"
        content={formatMessage(messages.cannotEditReport)}
      >
        <div>
          <BaseButton
            icon="edit"
            buttonStyle="secondary"
            disabled={isLoading || !canEdit}
            linkTo={`/admin/reporting/report-builder/${reportId}/editor`}
          >
            {formatMessage(messages.edit)}
          </BaseButton>
        </div>
      </Tippy>
    </>
  );
};

export default Buttons;
