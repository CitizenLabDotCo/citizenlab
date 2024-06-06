import React from 'react';

import { Box, Title, Toggle } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import usePhase from 'api/phases/usePhase';
import useReport from 'api/reports/useReport';
import useUpdateReport from 'api/reports/useUpdateReport';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Buttons from 'containers/Admin/reporting/components/ReportBuilderPage/ReportRow/Buttons';
import { MAX_REPORT_WIDTH } from 'containers/Admin/reporting/constants';

import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { pastPresentOrFuture } from 'utils/dateUtils';

import EmptyState from './EmptyState';
import messages from './messages';
import ReportPreview from './ReportPreview';

const ReportTab = () => {
  const { phaseId } = useParams();
  const { data: phase } = usePhase(phaseId);
  const { data: report } = useReport(
    phase?.data.relationships.report?.data?.id
  );

  const reportBuilderEnabled = useFeatureFlag({ name: 'report_builder' });
  const { formatMessage } = useIntl();

  const { mutate: updateReport } = useUpdateReport();

  if (!reportBuilderEnabled || !phase) return null;

  const reportId = phase.data.relationships.report?.data?.id;
  const hasReport = !!reportId;

  const getWarningMessage = () => {
    if (!report) return '';

    const reportVisible = report.data.attributes.visible;
    const phaseStarted =
      pastPresentOrFuture(phase.data.attributes.start_at) !== 'future';

    if (!reportVisible && !phaseStarted) {
      return formatMessage(messages.notVisibleNotStarted);
    }

    if (reportVisible && !phaseStarted) {
      return formatMessage(messages.visibleNotStarted);
    }

    if (!reportVisible && phaseStarted) {
      return formatMessage(messages.notVisibleStarted);
    }

    return formatMessage(messages.visibleStarted);
  };

  return (
    <Box w="100%">
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Title styleVariant="h3" color="primary">
          {formatMessage(messages.report)}
        </Title>
        {hasReport && report && (
          <Box display="flex" h="100%" alignItems="center">
            <Box mr="16px">
              <Toggle
                checked={report.data.attributes.visible}
                onChange={() => {
                  updateReport({
                    id: report.data.id,
                    visible: !report.data.attributes.visible,
                  });
                }}
                label={formatMessage(messages.visible)}
              />
            </Box>
            <Buttons reportId={reportId} showDuplicate={false} />
          </Box>
        )}
      </Box>
      {hasReport ? (
        <>
          <Box maxWidth={MAX_REPORT_WIDTH}>
            <Warning>{getWarningMessage()}</Warning>
          </Box>
          <Box mt="32px">
            <ReportPreview reportId={reportId} phaseId={phase.data.id} />
          </Box>
        </>
      ) : (
        <EmptyState
          projectId={phase.data.relationships.project.data.id}
          phaseId={phase.data.id}
        />
      )}
    </Box>
  );
};

export default ReportTab;
