import React from 'react';

// routing
import { useParams } from 'react-router-dom';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import usePhase from 'api/phases/usePhase';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import EmptyState from './EmptyState';
import ReportPreview from './ReportPreview';

const ReportTab = () => {
  const { phaseId } = useParams();
  const { data: phase } = usePhase(phaseId);

  const phaseReportsEnabled = useFeatureFlag({ name: 'phase_reports' });
  const { formatMessage } = useIntl();

  if (!phaseReportsEnabled || !phase) return null;

  const reportId = phase.data.relationships.report?.data?.id;
  const hasReport = !!reportId;

  return (
    <Box>
      <Title variant="h3" color="primary">
        {formatMessage(messages.report)}
      </Title>
      {hasReport ? (
        <ReportPreview reportId={reportId} phaseId={phase.data.id} />
      ) : (
        <EmptyState />
      )}
    </Box>
  );
};

export default ReportTab;
