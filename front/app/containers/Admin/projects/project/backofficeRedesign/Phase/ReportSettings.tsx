import React from 'react';

import { IPhaseData } from 'api/phases/types';
import useReport from 'api/reports/useReport';
import useReportBuilderEnabled from 'api/reports/useReportBuilderEnabled';
import useUpdateReport from 'api/reports/useUpdateReport';

import SummaryPill from 'containers/Admin/projects/_shared/components/SummaryPill';
import visibilityWarning from 'containers/Admin/projects/project/information/ReportTab/visibilityWarning';
import useConfirmDeleteReport from 'containers/Admin/reporting/components/ReportBuilderPage/ReportRow/useConfirmDeleteReport';

import Button from 'design-system/Button';
import Disclosure from 'design-system/Disclosure';
import Switch from 'design-system/Switch';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import styles from './ReportSettings.module.css';
import 'design-system/tokens.css';

interface Props {
  phase: IPhaseData;
}

const ReportSettings = ({ phase }: Props) => {
  const { formatMessage } = useIntl();
  const reportId = phase.relationships.report?.data?.id;
  const { data: report } = useReport(reportId);
  const { mutate: updateReport } = useUpdateReport();
  const { confirmDelete, isDeleting } = useConfirmDeleteReport();
  const reportBuilderEnabled = useReportBuilderEnabled();

  if (!reportBuilderEnabled || !report) return null;

  const visible = report.data.attributes.visible;
  const canEdit =
    report.data.attributes.action_descriptors.editing_report.enabled;

  return (
    <Disclosure
      title={formatMessage(messages.reportVisibility)}
      summary={
        <SummaryPill
          label={formatMessage(
            visible ? messages.reportVisible : messages.reportNotVisible
          )}
        />
      }
    >
      <Switch
        size={26}
        isSelected={visible}
        onChange={() => updateReport({ id: report.data.id, visible: !visible })}
      >
        <span className={styles.switchLabel}>
          <span className={styles.label}>
            {formatMessage(messages.reportVisibleToParticipants)}
          </span>
          <span className={styles.helper}>
            {formatMessage(visibilityWarning(report, phase))}
          </span>
        </span>
      </Switch>
      <div>
        <Button
          variant="danger"
          size={28}
          isPending={isDeleting}
          isDisabled={!canEdit}
          onPress={() => confirmDelete(report)}
        >
          {formatMessage(messages.deleteReport)}
        </Button>
      </div>
    </Disclosure>
  );
};

export default ReportSettings;
