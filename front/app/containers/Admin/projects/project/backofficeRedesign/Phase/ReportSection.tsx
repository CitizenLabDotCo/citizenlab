import React, { useState } from 'react';

import {
  Box,
  Button,
  Text,
  Toggle,
  bo,
} from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import useReport from 'api/reports/useReport';
import useReportBuilderEnabled from 'api/reports/useReportBuilderEnabled';
import useUpdateReport from 'api/reports/useUpdateReport';

import CreateReportModal from 'containers/Admin/projects/project/information/ReportTab/CreateReportModal';
import messages from 'containers/Admin/projects/project/information/ReportTab/messages';
import visibilityWarning from 'containers/Admin/projects/project/information/ReportTab/visibilityWarning';
import Buttons from 'containers/Admin/reporting/components/ReportBuilderPage/ReportRow/Buttons';

import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

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
  const { mutate: updateReport } = useUpdateReport();
  const reportBuilderEnabled = useReportBuilderEnabled();

  if (!reportBuilderEnabled) return null;

  if (!reportId) {
    return (
      <PanelField
        label={formatMessage(messages.report)}
        action={
          <Button
            id="e2e-create-report-button"
            buttonStyle="bo-primary"
            icon="plus"
            height={bo.buttonMedium.height}
            padding={bo.buttonMedium.padding}
            fontSize={bo.buttonMedium.fontSize}
            iconSize={bo.buttonMedium.iconSize}
            width="auto"
            onClick={() => setCreateOpened(true)}
          >
            {formatMessage(messages.createReport)}
          </Button>
        }
      >
        <Text variant="boHelper" m="0">
          {formatMessage(messages.createAReportTo)}
        </Text>
        <Box as="ul" pl="20px" m="0">
          <li>
            <Text variant="boHelper" m="0">
              {formatMessage(messages.shareResults)}
            </Text>
          </li>
          <li>
            <Text variant="boHelper" m="0">
              {formatMessage(messages.createAMoreComplex)}
            </Text>
          </li>
        </Box>
        <Text variant="boHelper" m="0">
          {formatMessage(messages.afterCreating)}
        </Text>
        <CreateReportModal
          projectId={projectId}
          phaseId={phase.id}
          open={createOpened}
          onClose={() => setCreateOpened(false)}
        />
      </PanelField>
    );
  }

  return (
    <PanelField
      label={formatMessage(messages.report)}
      action={
        <Box display="flex" alignItems="center">
          <Buttons reportId={reportId} showDuplicate={false} />
        </Box>
      }
    >
      {report && (
        <>
          <Toggle
            size="small"
            label={
              <Text as="span" variant="boControl" m="0">
                {formatMessage(messages.visible)}
              </Text>
            }
            checked={report.data.attributes.visible}
            onChange={() =>
              updateReport({
                id: report.data.id,
                visible: !report.data.attributes.visible,
              })
            }
          />
          <Warning variant="bo">
            {formatMessage(visibilityWarning(report, phase))}
          </Warning>
        </>
      )}
    </PanelField>
  );
};

export default ReportSection;
