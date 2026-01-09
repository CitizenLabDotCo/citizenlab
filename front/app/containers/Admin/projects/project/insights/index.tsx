import React, { useState } from 'react';

import {
  Box,
  Title,
  Button,
  Text,
  Dropdown,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useAnalyses from 'api/analyses/useAnalyses';
import usePhase from 'api/phases/usePhase';

import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import { getAnalysisScope } from '../../components/AnalysisBanner/utils';

import DemographicsSection from './demographics/DemographicsSection';
import InsightsPdfContent from './InsightsPdfContent';
import messages from './messages';
import MethodSpecificInsights from './methodSpecific/MethodSpecificInsights';
import SurveyActions from './methodSpecific/nativeSurvey/SurveyActions';
import ParticipantsTimeline from './ParticipantsTimeline';
import ParticipationMetrics from './participationMetrics/ParticipationMetrics';
import { PdfExportProvider, usePdfExportContext } from './PdfExportContext';
import { WordExportProvider, useWordExportContext } from './WordExportContext';

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.tenantText};

  &:hover {
    background-color: ${({ theme }) => theme.colors.grey100};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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

// Inner component that uses the PDF and Word export contexts (visible UI)
const InsightsContent = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { data: phase } = usePhase(phaseId);
  const { formatMessage } = useIntl();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const {
    downloadPdf,
    isDownloading: isDownloadingPdf,
    error: pdfError,
  } = usePdfExportContext();

  const {
    downloadWord,
    isDownloading: isDownloadingWord,
    error: wordError,
  } = useWordExportContext();

  const isDownloading = isDownloadingPdf || isDownloadingWord;
  const exportError = pdfError || wordError;

  const handleDownloadPdf = () => {
    setDropdownOpen(false);
    downloadPdf();
  };

  const handleDownloadWord = () => {
    setDropdownOpen(false);
    downloadWord();
  };

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

  return (
    <>
      {/* Visible UI - never changes during PDF export */}
      <Box
        background="white"
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
          alignItems="center"
        >
          <Title variant="h2" as="h1" color="textPrimary" m="0px">
            <FormattedMessage {...messages.insights} />
          </Title>
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
                  <Box position="relative">
                    <Button
                      buttonStyle={supportsAiAnalysis ? 'secondary' : 'primary'}
                      icon="download"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      processing={isDownloading}
                      aria-label={formatMessage(messages.download)}
                    >
                      <FormattedMessage {...messages.download} />
                    </Button>
                    <Dropdown
                      opened={dropdownOpen}
                      onClickOutside={() => setDropdownOpen(false)}
                      top="42px"
                      right="0px"
                      content={
                        <Box display="flex" flexDirection="column" py="4px">
                          <DropdownButton
                            onClick={handleDownloadPdf}
                            disabled={isDownloadingPdf}
                          >
                            <FormattedMessage {...messages.downloadPdf} />
                          </DropdownButton>
                          <DropdownButton
                            onClick={handleDownloadWord}
                            disabled={isDownloadingWord}
                          >
                            <FormattedMessage {...messages.downloadWord} />
                          </DropdownButton>
                        </Box>
                      }
                    />
                  </Box>
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
                {exportError && (
                  <Text fontSize="s" color="error" m="0px">
                    {exportError}
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

      {/* Hidden container for PDF rendering - only mounted during PDF export */}
      {/* Word export has its own hidden container in WordExportProvider */}
      {isDownloadingPdf && (
        <div style={hiddenContainerStyle}>
          <InsightsPdfContent phase={phase.data} />
        </div>
      )}
    </>
  );
};

// Main component that wraps with PdfExportProvider and WordExportProvider
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

  if (!phase) {
    return null;
  }

  return (
    <PdfExportProvider filename={sanitizedPhaseName}>
      <WordExportProvider filename={sanitizedPhaseName} phase={phase.data}>
        <InsightsContent />
      </WordExportProvider>
    </PdfExportProvider>
  );
};

export default AdminPhaseInsights;
