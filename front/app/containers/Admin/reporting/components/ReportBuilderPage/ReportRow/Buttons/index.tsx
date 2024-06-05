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

const Tooltip = ({ disabled, content, children }) => (
  <Tippy
    disabled={disabled}
    interactive={true}
    placement="bottom"
    content={content}
  >
    <div> {children} </div>
  </Tippy>
);

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
    report.data.attributes.action_descriptors.editing_report.enabled;

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
        <Tooltip
          disabled={canEdit}
          content={formatMessage(messages.cannotDuplicateReport)}
        >
          <BaseButton
            icon="copy"
            buttonStyle="secondary-outlined"
            processing={isDuplicating}
            disabled={isLoading || !canEdit}
            onClick={() => duplicateReport({ id: reportId })}
          >
            {formatMessage(messages.duplicate)}
          </BaseButton>
        </Tooltip>
      )}

      <Tooltip
        disabled={canEdit}
        content={formatMessage(messages.cannotEditReport)}
      >
        <BaseButton
          icon="edit"
          buttonStyle="secondary-outlined"
          disabled={isLoading || !canEdit}
          linkTo={`/admin/reporting/report-builder/${reportId}/editor`}
        >
          {formatMessage(messages.edit)}
        </BaseButton>
      </Tooltip>
    </>
  );
};

export default Buttons;
