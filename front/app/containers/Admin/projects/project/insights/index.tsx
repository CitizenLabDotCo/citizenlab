import React from 'react';

import { Box, Title, Button } from 'component-library';
import { useParams } from 'react-router-dom';

import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useAnalyses from 'api/analyses/useAnalyses';
import usePhase from 'api/phases/usePhase';

import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import { getAnalysisScope } from '../../components/AnalysisBanner/utils';

import DemographicsSection from './DemographicsSection';
import messages from './messages';
import MethodSpecificInsights from './methodSpecific/MethodSpecificInsights';
import SurveyActions from './methodSpecific/nativeSurvey/SurveyActions';
import ParticipantsTimeline from './ParticipantsTimeline';
import ParticipationMetrics from './ParticipationMetrics';
import { PdfExportProvider, usePdfExportContext } from './PdfExportContext';

const AI_ANALYSIS_SUPPORTED_METHODS = [
  'ideation',
  'voting',
  'proposals',
  'native_survey',
];

// Inner component that uses the PDF export context
const InsightsContent = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { data: phase } = usePhase(phaseId);
  const { formatMessage } = useIntl();
  const {
    downloadPdf,
    isDownloading: isDownloadingPdf,
    isPdfExport,
  } = usePdfExportContext();

  const participationMethod = phase?.data.attributes.participation_method;
  const supportsAiAnalysis =
    participationMethod &&
    AI_ANALYSIS_SUPPORTED_METHODS.includes(participationMethod);
  const scope = getAnalysisScope(participationMethod);

  // Get the analysis - use projectId for project-scoped methods, phaseId for phase-scoped
  const { data: analyses } = useAnalyses(
    supportsAiAnalysis
      ? scope === 'project'
        ? { projectId }
        : { phaseId }
      : { phaseId: undefined }
  );
  const analysisId = analyses?.data[0]?.id;

  const { mutate: createAnalysis, isLoading: isCreatingAnalysis } =
    useAddAnalysis();

  const handleGoToAnalysis = () => {
    if (analysisId) {
      clHistory.push(
        `/admin/projects/${projectId}/analysis/${analysisId}?phase_id=${phaseId}&from=insights`
      );
    } else {
      // Create analysis with projectId for project-scoped methods, phaseId for phase-scoped
      const analysisParams = scope === 'project' ? { projectId } : { phaseId };
      createAnalysis(analysisParams, {
        onSuccess: (analysis) => {
          clHistory.push(
            `/admin/projects/${projectId}/analysis/${analysis.data.id}?phase_id=${phaseId}&from=insights`
          );
        },
      });
    }
  };

  if (!phase) {
    return null;
  }

  const isNativeSurvey = participationMethod === 'native_survey';

  // Get phase name for PDF title
  const phaseName =
    Object.values(phase.data.attributes.title_multiloc)[0] || '';

  return (
    <Box
      id="insights-pdf-container"
      background="white"
      borderBottom="none"
      display="flex"
      flexDirection="column"
      role="region"
      aria-label="Phase Insights"
    >
      {isPdfExport && phaseName && (
        <Title variant="h1" as="h1" color="textPrimary" m="0px" mb="24px">
          {phaseName}
        </Title>
      )}
      <Box
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        <Title
          variant="h2"
          as={isPdfExport ? 'h2' : 'h1'}
          color="textPrimary"
          m="0px"
        >
          <FormattedMessage {...messages.insights} />
        </Title>
        <Box display="flex" gap="8px">
          {isNativeSurvey ? (
            <SurveyActions phase={phase.data} />
          ) : (
            <Box display="flex" gap="8px" data-pdf-exclude="true">
              <Button
                buttonStyle={supportsAiAnalysis ? 'secondary' : 'primary'}
                icon="download"
                onClick={downloadPdf}
                processing={isDownloadingPdf}
                aria-label={formatMessage(messages.downloadInsightsPdf)}
              >
                <FormattedMessage {...messages.download} />
              </Button>
              {supportsAiAnalysis && (
                <Button
                  buttonStyle="primary"
                  icon="stars"
                  onClick={handleGoToAnalysis}
                  processing={isCreatingAnalysis}
                >
                  <FormattedMessage {...messages.aiAnalysis} />
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap="16px" pt="16px">
        <PageBreakBox>
          <ParticipationMetrics phase={phase.data} />
        </PageBreakBox>

        <PageBreakBox>
          <ParticipantsTimeline phaseId={phase.data.id} />
        </PageBreakBox>

        <DemographicsSection phase={phase.data} />

        <PageBreakBox>
          <MethodSpecificInsights
            phaseId={phase.data.id}
            participationMethod={phase.data.attributes.participation_method}
          />
        </PageBreakBox>
      </Box>
    </Box>
  );
};

// Main component that wraps with PdfExportProvider
const AdminPhaseInsights = () => {
  const { phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { data: phase } = usePhase(phaseId);

  // Get phase title for filename, fallback to phaseId if not loaded yet
  const phaseTitle = phase?.data.attributes.title_multiloc;
  const phaseName = phaseTitle
    ? Object.values(phaseTitle)[0] || `phase-${phaseId}`
    : `phase-${phaseId}`;

  // Sanitize filename: replace spaces and special characters
  const sanitizedPhaseName = phaseName
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();

  return (
    <PdfExportProvider filename={sanitizedPhaseName}>
      <InsightsContent />
    </PdfExportProvider>
  );
};

export default AdminPhaseInsights;
