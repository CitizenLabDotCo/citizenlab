import React from 'react';

import { Box, Title, Button, Text } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useAnalyses from 'api/analyses/useAnalyses';
import usePhase from 'api/phases/usePhase';

import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { pastPresentOrFuture } from 'utils/dateUtils';

import { getAnalysisScope } from '../../components/AnalysisBanner/utils';

import DemographicsSection from './demographics/DemographicsSection';
import messages from './messages';
import MethodSpecificInsights from './methodSpecific/MethodSpecificInsights';
import SurveyActions from './methodSpecific/nativeSurvey/SurveyActions';
import ParticipantsTimeline from './ParticipantsTimeline';
import ParticipationMetrics from './participationMetrics/ParticipationMetrics';
import InsightsPdfContent from './pdf/InsightsPdfContent';
import { PdfExportProvider, usePdfExportContext } from './pdf/PdfExportContext';
import ExportValidation from './word/ExportValidation';
import wordMessages from './word/messages';
import {
  WordExportProvider,
  useWordExportContext,
} from './word/WordExportContext';

const DropdownButton = styled(ButtonWithLink)`
  button {
    display: flex !important;
    justify-content: flex-start !important;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const AI_ANALYSIS_SUPPORTED_METHODS = [
  'ideation',
  'voting',
  'proposals',
  'native_survey',
];

// Hidden container styles for PDF rendering (offscreen, but must remain "visible" for SVG rendering)
// Note: visibility: hidden breaks Recharts SVG path rendering, so we use positioning instead
const hiddenContainerStyle: React.CSSProperties = {
  position: 'fixed',
  left: '-9999px',
  top: 0,
  width: '800px',
  height: 'auto',
  minHeight: '100vh',
  pointerEvents: 'none',
  zIndex: -9999,
  overflow: 'visible',
};

// Inner component that uses the PDF export context (visible UI)
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
    error: pdfError,
  } = usePdfExportContext();

  const {
    downloadWord,
    isDownloading: isDownloadingWord,
    exportStatus,
    exportProgress,
    allComponentsReady,
    error: wordError,
    captureWarnings,
  } = useWordExportContext();

  const isDownloading = isDownloadingPdf || isDownloadingWord;
  const exportError = pdfError || wordError;

  const getExportStatusText = () => {
    switch (exportStatus) {
      case 'preparing':
        return formatMessage(wordMessages.exportPreparing);
      case 'capturing':
        return formatMessage(wordMessages.exportCapturing, {
          completed: exportProgress.completed,
          total: exportProgress.total,
        });
      case 'generating':
        return formatMessage(wordMessages.exportGenerating);
      default:
        return null;
    }
  };

  const toggleDropdown = (value?: boolean) => () => {
    setDropdownOpened(value ?? !dropdownOpened);
  };

  const handleDownloadPdf = async () => {
    setDropdownOpened(false);
    await downloadPdf();
  };

  const handleDownloadWord = async () => {
    setDropdownOpened(false);
    await downloadWord();
  };

  const participationMethod = phase?.data.attributes.participation_method;
  const { start_at, end_at } = phase?.data.attributes || {};
  const isFuturePhase = start_at
    ? pastPresentOrFuture([start_at, end_at ?? null]) === 'future'
    : false;
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

  return (
    <>
      {/* Visible UI - never changes during PDF export */}
      <Box
        borderBottom="none"
        display="flex"
        flexDirection="column"
        role="region"
        aria-label="Phase Insights"
      >
        <Box
          display="flex"
          w="100%"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Title variant="h2" as="h1" color="textPrimary" m="0px">
              <FormattedMessage {...messages.insights} />
            </Title>
            <Text fontSize="s" color="textSecondary" m="0" mt="4px">
              <FormattedMessage {...messages.insightsSubtitle1} />
            </Text>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            gap="8px"
            alignItems="flex-end"
          >
            {isNativeSurvey ? (
              <SurveyActions phase={phase.data} />
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                gap="8px"
                alignItems="flex-end"
              >
                <Box display="flex" gap="8px">
                  <DropdownContainer>
                    <Button
                      buttonStyle={supportsAiAnalysis ? 'secondary' : 'primary'}
                      icon="download"
                      onClick={toggleDropdown()}
                      processing={isDownloading}
                      disabled={!allComponentsReady && !isDownloading}
                      aria-label={formatMessage(messages.downloadInsightsPdf)}
                    >
                      <FormattedMessage {...messages.download} />
                    </Button>
                    <Dropdown
                      width="180px"
                      top="42px"
                      right="0px"
                      opened={dropdownOpened}
                      onClickOutside={toggleDropdown(false)}
                      content={
                        <Box
                          p="8px"
                          display="flex"
                          flexDirection="column"
                          gap="4px"
                        >
                          <DropdownButton
                            onClick={handleDownloadPdf}
                            buttonStyle="text"
                            padding="8px"
                            fontSize={`${fontSizes.s}px`}
                          >
                            <FormattedMessage {...messages.downloadPdf} />
                          </DropdownButton>
                          <DropdownButton
                            onClick={handleDownloadWord}
                            buttonStyle="text"
                            padding="8px"
                            fontSize={`${fontSizes.s}px`}
                          >
                            <FormattedMessage {...messages.downloadWord} />
                          </DropdownButton>
                        </Box>
                      }
                    />
                  </DropdownContainer>
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
                {isDownloadingWord && getExportStatusText() && (
                  <Text fontSize="s" color="textSecondary" m="0px">
                    {getExportStatusText()}
                  </Text>
                )}
                {exportError && (
                  <Text fontSize="s" color="error" m="0px">
                    {formatMessage(messages.errorPdfDownload)}
                  </Text>
                )}
                {captureWarnings.length > 0 && !isDownloading && (
                  <Text fontSize="s" color="orange500" m="0px">
                    {formatMessage(wordMessages.exportCaptureWarning)}
                  </Text>
                )}
              </Box>
            )}
          </Box>
        </Box>

        <Box display="flex" flexDirection="column" gap="16px" pt="16px">
          <PageBreakBox>
            <ParticipationMetrics phase={phase.data} />
          </PageBreakBox>

          {!isFuturePhase && (
            <>
              <PageBreakBox>
                <ParticipantsTimeline phaseId={phase.data.id} />
              </PageBreakBox>

              <DemographicsSection phase={phase.data} />

              <PageBreakBox>
                <MethodSpecificInsights
                  phaseId={phase.data.id}
                  participationMethod={
                    phase.data.attributes.participation_method
                  }
                />
              </PageBreakBox>
            </>
          )}
        </Box>
      </Box>

      {/* Hidden container for PDF rendering - only mounted during export */}
      {isDownloadingPdf && (
        <div style={hiddenContainerStyle}>
          <PdfExportProvider isPdfRenderMode>
            <InsightsPdfContent phase={phase.data} />
          </PdfExportProvider>
        </div>
      )}
    </>
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

  const participationMethod = phase?.data.attributes.participation_method;

  return (
    <PdfExportProvider filename={sanitizedPhaseName}>
      <WordExportProvider
        filename={sanitizedPhaseName}
        participationMethod={participationMethod}
      >
        <InsightsContent />
        <ExportValidation />
      </WordExportProvider>
    </PdfExportProvider>
  );
};

export default AdminPhaseInsights;
