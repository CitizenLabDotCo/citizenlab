import React from 'react';

// routing
import { useParams } from 'react-router-dom';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import usePhase from 'api/phases/usePhase';
import useReport from 'api/reports/useReport';
import useDeleteReport from 'api/reports/useDeleteReport';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import EmptyState from './EmptyState';
import ReportPreview from './ReportPreview';
import Buttons from 'containers/Admin/reporting/components/ReportBuilderPage/ReportRow/Buttons';

const ReportTab = () => {
  const { phaseId } = useParams();
  const { data: phase } = usePhase(phaseId);
  const { data: report } = useReport(
    phase?.data.relationships.report?.data?.id
  );

  const phaseReportsEnabled = useFeatureFlag({ name: 'phase_reports' });
  const { formatMessage } = useIntl();

  const { mutate: deleteReport, isLoading } = useDeleteReport();

  if (!phaseReportsEnabled || !phase) return null;

  const handleDeleteReport = async () => {
    if (!report) return;
    if (window.confirm(formatMessage(messages.areYouSureYouWantToDelete))) {
      deleteReport(report.data.id);
    }
  };

  const reportId = phase.data.relationships.report?.data?.id;
  const hasReport = !!reportId;

  return (
    <Box w="100%">
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Title variant="h3" color="primary">
          {formatMessage(messages.report)}
        </Title>
        {hasReport && (
          <Buttons
            reportId={reportId}
            isLoading={isLoading}
            onDelete={handleDeleteReport}
          />
        )}
      </Box>
      {hasReport ? (
        <ReportPreview reportId={reportId} phaseId={phase.data.id} />
      ) : (
        <EmptyState />
      )}
    </Box>
  );
};

export default ReportTab;
