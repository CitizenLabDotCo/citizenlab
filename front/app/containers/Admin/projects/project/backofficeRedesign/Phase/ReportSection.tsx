import React from 'react';

import { Box, Text, Title, Toggle } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import useReport from 'api/reports/useReport';
import useReportBuilderEnabled from 'api/reports/useReportBuilderEnabled';
import useUpdateReport from 'api/reports/useUpdateReport';

import EmptyState from 'containers/Admin/projects/project/information/ReportTab/EmptyState';
import messages from 'containers/Admin/projects/project/information/ReportTab/messages';
import visibilityWarning from 'containers/Admin/projects/project/information/ReportTab/visibilityWarning';
import Buttons from 'containers/Admin/reporting/components/ReportBuilderPage/ReportRow/Buttons';

import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

interface Props {
  projectId: string;
  phase: IPhaseData;
}

const ReportSection = ({ projectId, phase }: Props) => {
  const { formatMessage } = useIntl();
  const reportId = phase.relationships.report?.data?.id;
  const { data: report } = useReport(reportId);
  const { mutate: updateReport } = useUpdateReport();
  const reportBuilderEnabled = useReportBuilderEnabled();

  if (!reportBuilderEnabled) return null;

  return (
    <Box display="flex" flexDirection="column" gap="12px">
      <Title variant="h4" m="0">
        {formatMessage(messages.report)}
      </Title>

      {reportId ? (
        <>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            {report && (
              <Toggle
                checked={report.data.attributes.visible}
                onChange={() =>
                  updateReport({
                    id: report.data.id,
                    visible: !report.data.attributes.visible,
                  })
                }
                label={formatMessage(messages.visible)}
              />
            )}
            <Buttons reportId={reportId} showDuplicate={false} />
          </Box>
          {report && (
            <Warning>
              <Text m="0" fontSize="s">
                {formatMessage(visibilityWarning(report, phase))}
              </Text>
            </Warning>
          )}
        </>
      ) : (
        <EmptyState projectId={projectId} phaseId={phase.id} />
      )}
    </Box>
  );
};

export default ReportSection;
