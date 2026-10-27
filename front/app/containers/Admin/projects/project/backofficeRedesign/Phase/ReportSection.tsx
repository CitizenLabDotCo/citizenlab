import React, { useState } from 'react';

import { Box, Button, Tooltip } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import useReport from 'api/reports/useReport';
import useReportBuilderEnabled from 'api/reports/useReportBuilderEnabled';

import CreateReportModal from 'containers/Admin/projects/project/information/ReportTab/CreateReportModal';
import messages from 'containers/Admin/projects/project/information/ReportTab/messages';
import topBarMessages from 'containers/Admin/reporting/components/ReportBuilder/TopBar/messages';
import reportRowMessages from 'containers/Admin/reporting/components/ReportBuilderPage/ReportRow/messages';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import workspaceMessages from '../messages';

import PanelField from './BuildPanel/PanelField';

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
              buttonStyle="bo-primary"
              icon="plus"
              boSize="medium"
              width="auto"
              onClick={() => setCreateOpened(true)}
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
        <Box display="flex" alignItems="center" gap="8px">
          <Button
            buttonStyle="bo-secondary"
            boSize="medium"
            width="auto"
            onClick={() =>
              window.open(
                `/admin/reporting/report-builder/${reportId}/print`,
                '_blank',
                'noreferrer'
              )
            }
          >
            {formatMessage(topBarMessages.download)}
          </Button>
          <Tooltip
            disabled={!report || canEdit}
            placement="bottom"
            content={formatMessage(reportRowMessages.cannotEditReport)}
          >
            <div>
              <ButtonWithLink
                buttonStyle="bo-secondary"
                boSize="medium"
                width="auto"
                disabled={!canEdit}
                to="/admin/reporting/report-builder/$reportId/editor"
                params={{ reportId }}
              >
                {formatMessage(workspaceMessages.editReport)}
              </ButtonWithLink>
            </div>
          </Tooltip>
        </Box>
      }
    />
  );
};

export default ReportSection;
