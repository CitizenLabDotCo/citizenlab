import React, { useState } from 'react';

import { IPhaseData } from 'api/phases/types';
import useReport from 'api/reports/useReport';
import useReportBuilderEnabled from 'api/reports/useReportBuilderEnabled';

import CreateReportModal from 'containers/Admin/projects/project/information/ReportTab/CreateReportModal';
import messages from 'containers/Admin/projects/project/information/ReportTab/messages';
import topBarMessages from 'containers/Admin/reporting/components/ReportBuilder/TopBar/messages';
import reportRowMessages from 'containers/Admin/reporting/components/ReportBuilderPage/ReportRow/messages';

import Button from 'design-system/Button';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import PanelField from './BuildPanel/PanelField';
import phaseMessages from './messages';
import styles from './ReportSection.module.css';
import 'design-system/tokens.css';

interface Props {
  projectId: string;
  phase: IPhaseData;
}

const ReportSection = ({ projectId, phase }: Props) => {
  const { formatMessage } = useIntl();
  const [createOpened, setCreateOpened] = useState(false);
  const reportId = phase.relationships.report?.data?.id;
  const { data: report } = useReport(reportId);
  const reportBuilderEnabled = useReportBuilderEnabled();

  if (!reportBuilderEnabled) return null;

  if (!reportId) {
    return (
      <>
        <PanelField
          label={formatMessage(messages.report)}
          action={
            <Button
              id="e2e-create-report-button"
              variant="primary"
              size={28}
              icon="plus-16"
              onPress={() => setCreateOpened(true)}
            >
              {formatMessage(messages.createReport)}
            </Button>
          }
        />
        <CreateReportModal
          projectId={projectId}
          phaseId={phase.id}
          open={createOpened}
          onClose={() => setCreateOpened(false)}
        />
      </>
    );
  }

  const canEdit =
    !!report?.data.attributes.action_descriptors.editing_report.enabled;

  return (
    <PanelField
      label={formatMessage(messages.report)}
      action={
        <div className={styles.actions}>
          <Button
            variant="secondary"
            size={28}
            onPress={() =>
              window.open(
                `/admin/reporting/report-builder/${reportId}/print`,
                '_blank',
                'noreferrer'
              )
            }
          >
            {formatMessage(topBarMessages.download)}
          </Button>
          <Button
            variant="secondary"
            size={28}
            isDisabled={!canEdit}
            disabledReason={
              report && !canEdit
                ? formatMessage(reportRowMessages.cannotEditReport)
                : undefined
            }
            onPress={() =>
              clHistory.push(
                `/admin/reporting/report-builder/${reportId}/editor`
              )
            }
          >
            {formatMessage(phaseMessages.editReport)}
          </Button>
        </div>
      }
    />
  );
};

export default ReportSection;
