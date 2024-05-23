import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

import useReport from 'api/reports/useReport';

import Button from 'components/UI/Button';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import PrintReportButton from './PrintReportButton';

interface Props {
  reportId: string;
  isLoading: boolean;
  onDelete: () => void;
}

const Buttons = ({ reportId, isLoading, onDelete }: Props) => {
  const { data: report } = useReport(reportId);
  const { formatMessage } = useIntl();

  if (!report) return null;

  const canEdit =
    report.data.attributes.action_descriptors.editing_report.enabled;

  return (
    <>
      <Button
        id="e2e-delete-report-button"
        mr="8px"
        icon="delete"
        buttonStyle="white"
        textColor={colors.textSecondary}
        onClick={onDelete}
        processing={isLoading}
        disabled={isLoading || !canEdit}
        iconSize="18px"
      >
        {formatMessage(messages.delete)}
      </Button>
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
      <PrintReportButton reportId={reportId} />
    </>
  );
};

export default Buttons;
