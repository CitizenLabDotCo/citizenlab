import React, { useState } from 'react';

import {
  Box,
  Title,
  Button,
  Text,
  Dropdown,
  DropdownListItem,
  Badge,
  colors,
} from '@citizenlab/cl2-component-library';

import DsBadge from 'design-system/Badge';
import Disclosure from 'design-system/Disclosure';
import Menu, { MenuItem, MenuTrigger } from 'design-system/Menu';

import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useAnalyses from 'api/analyses/useAnalyses';
import usePhase from 'api/phases/usePhase';

import useLocalize from 'hooks/useLocalize';
import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import projectFilesMessages from 'containers/Admin/projects/project/files/components/messages';
import useInputResponseExport from 'containers/Admin/projects/project/inputResponseExport/useInputResponseExport';

import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import Navigate from 'utils/cl-router/Navigate';
import { captureAllMapScreenshots } from 'utils/mapViewRegistry';
import { useParams } from 'utils/router';

import { getAnalysisScope } from '../../_shared/components/AnalysisBanner/utils';
import InsightsSkeleton from '../backofficeRedesign/WorkspaceSkeleton/InsightsSkeleton';

import DemographicsSection from './demographics/DemographicsSection';
import getExportFilename from './getExportFilename';
import styles from './Insights.module.css';
import messages from './messages';
import MethodSpecificInsights from './methodSpecific/MethodSpecificInsights';
import SurveyActions from './methodSpecific/nativeSurvey/SurveyActions';
import ParticipantsTimeline from './ParticipantsTimeline';
import ParticipationMetrics from './participationMetrics/ParticipationMetrics';
import InsightsPdfContent from './pdf/InsightsPdfContent';
import { PdfExportProvider, usePdfExportContext } from './pdf/PdfExportContext';
import PdfRenderModeProvider from './pdf/PdfRenderModeProvider';
import RecommendedActions from './RecommendedActions';
import wordMessages from './word/messages';
import {
  WordExportProvider,
  useWordExportContext,
} from './word/WordExportContext';
import 'design-system/tokens.css';

const AI_ANALYSIS_SUPPORTED_METHODS = [
  'ideation',
  'voting',
  'proposals',
  'native_survey',
];

// Methods handled by this generic action bar that offer the responses exports
// (PDF/Excel with PII review). Native survey has its own action bar
// (SurveyActions) and is excluded here; voting/common_ground have no fillable
// response form.
const INPUT_RESPONSE_EXPORT_METHODS = ['ideation', 'proposals'];

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

// Inner component that uses the export contexts (visible UI)
const InsightsContent = () => {
  const { projectId, phaseId } = useParams({ strict: false }) as {
    projectId: string;
    phaseId: string;
  };
  const { data: phase } = usePhase(phaseId);
  const redesigned = useProjectBackofficeRedesign();
  const { formatMessage } = useIntl();
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const inputResponseExport = useInputResponseExport({ projectId, phaseId });

  const {
    downloadPdf,
    isDownloading: isDownloadingPdf,
    error: pdfError,
    status: pdfStatus,
    progress: pdfProgress,
    skippedSections: pdfSkippedSections,
  } = usePdfExportContext();

  const {
    downloadWord,
    isDownloadingWord,
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

  const getPdfStatusText = () => {
    switch (pdfStatus) {
      case 'preparing':
        return formatMessage(wordMessages.exportPreparing);
      case 'capturing':
        return formatMessage(wordMessages.exportCapturing, {
          completed: pdfProgress.completed,
          total: pdfProgress.total,
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
    await captureAllMapScreenshots();
    await downloadPdf();
  };

  const handleDownloadWord = async () => {
    setDropdownOpened(false);
    await captureAllMapScreenshots();
    await downloadWord();
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

  const { mutate: createAnalysis, isPending: isCreatingAnalysis } =
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
    return redesigned ? <InsightsSkeleton /> : null;
  }

  const isNativeSurvey = participationMethod === 'native_survey';
  const showInputResponseExport =
    !!participationMethod &&
    INPUT_RESPONSE_EXPORT_METHODS.includes(participationMethod);

  const exportOptions = (
    <Box
      p="8px"
      display="flex"
      flexDirection="column"
      gap="4px"
      style={{ whiteSpace: 'nowrap' }}
    >
      {showInputResponseExport && (
        <>
          <DropdownListItem
            onClick={() => {
              setDropdownOpened(false);
              inputResponseExport.openPdfExportModal();
            }}
          >
            <FormattedMessage {...messages.exportResponsesToPdf} />
          </DropdownListItem>
          <DropdownListItem
            onClick={() => {
              setDropdownOpened(false);
              inputResponseExport.openXlsxExportModal();
            }}
          >
            <FormattedMessage {...messages.exportResponsesToXlsx} />
          </DropdownListItem>
        </>
      )}
      <DropdownListItem onClick={handleDownloadPdf}>
        <FormattedMessage {...messages.downloadPdf} />
      </DropdownListItem>
      <DropdownListItem onClick={handleDownloadWord}>
        <Box display="inline-flex" alignItems="center" gap="6px">
          <FormattedMessage {...messages.downloadWord} />
          <Badge color={colors.coolGrey600} className="inverse">
            {formatMessage(projectFilesMessages.beta)}
          </Badge>
        </Box>
      </DropdownListItem>
    </Box>
  );

  const exportStatusTexts = (
    <>
      {isDownloadingWord && getExportStatusText() && (
        <Text fontSize="s" color="textSecondary" m="0px">
          {getExportStatusText()}
        </Text>
      )}
      {isDownloadingPdf && getPdfStatusText() && (
        <Text fontSize="s" color="textSecondary" m="0px">
          {getPdfStatusText()}
        </Text>
      )}
      {exportError && (
        <Text fontSize="s" color="error" m="0px">
          {exportError}
        </Text>
      )}
      {(captureWarnings.length > 0 || pdfSkippedSections.length > 0) &&
        !isDownloading && (
          <Text fontSize="s" color="orange500" m="0px">
            {formatMessage(wordMessages.exportCaptureWarning)}
          </Text>
        )}
    </>
  );

  const actions = (
    <Box display="flex" flexDirection="column" gap="8px" alignItems="flex-end">
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
            <Box position="relative" display="inline-block">
              <Button
                buttonStyle={supportsAiAnalysis ? 'secondary' : 'primary'}
                icon="download"
                onClick={toggleDropdown()}
                processing={isDownloading}
                disabled={!allComponentsReady && !isDownloading}
                aria-label={formatMessage(messages.exportButton)}
              >
                <FormattedMessage {...messages.exportButton} />
              </Button>
              <Dropdown
                width="max-content"
                top="42px"
                right="12px"
                opened={dropdownOpened}
                onClickOutside={toggleDropdown(false)}
                zIndex="10000"
                content={exportOptions}
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
          {exportStatusTexts}
        </Box>
      )}
    </Box>
  );

  const panelStatusText =
    (isDownloadingWord && getExportStatusText()) ||
    (isDownloadingPdf && getPdfStatusText()) ||
    null;

  const panelActions = isNativeSurvey ? (
    <SurveyActions phase={phase.data} />
  ) : (
    <div className={styles.panelActions}>
      {supportsAiAnalysis && (
        <Disclosure
          header="button"
          title={formatMessage(messages.aiSensemaking)}
          actionIcon="sparkles-16"
          onPress={handleGoToAnalysis}
          isPending={isCreatingAnalysis}
        />
      )}
      <MenuTrigger>
        <Disclosure
          header="button"
          title={formatMessage(messages.downloadInsights)}
          actionIcon="download-16"
          isPending={isDownloading}
          isDisabled={!allComponentsReady && !isDownloading}
        />
        <Menu aria-label={formatMessage(messages.downloadInsights)}>
          <MenuItem onAction={handleDownloadPdf}>
            {formatMessage(messages.downloadPdf)}
          </MenuItem>
          <MenuItem
            onAction={handleDownloadWord}
            count={
              <DsBadge use="note">
                {formatMessage(projectFilesMessages.beta)}
              </DsBadge>
            }
          >
            {formatMessage(messages.downloadWord)}
          </MenuItem>
        </Menu>
      </MenuTrigger>
      {panelStatusText && <p className={styles.status}>{panelStatusText}</p>}
      {exportError && <p className={styles.statusError}>{exportError}</p>}
      {(captureWarnings.length > 0 || pdfSkippedSections.length > 0) &&
        !isDownloading && (
          <p className={styles.statusWarning}>
            {formatMessage(wordMessages.exportCaptureWarning)}
          </p>
        )}
    </div>
  );

  const dashboard = (
    <Box
      display="flex"
      flexDirection="column"
      gap={redesigned ? '14px' : '16px'}
      pt="16px"
    >
      <PageBreakBox>
        <ParticipationMetrics phase={phase.data} />
      </PageBreakBox>

      <PageBreakBox>
        <ParticipantsTimeline phase={phase.data} />
      </PageBreakBox>

      {!redesigned && <DemographicsSection phase={phase.data} />}

      <PageBreakBox>
        <MethodSpecificInsights
          phaseId={phase.data.id}
          participationMethod={phase.data.attributes.participation_method}
        />
      </PageBreakBox>

      {redesigned && <DemographicsSection phase={phase.data} />}
    </Box>
  );
  const header = (
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
      {actions}
    </Box>
  );

  return (
    <>
      {redesigned ? (
        <div
          className={styles.panelRegion}
          role="region"
          aria-label="Phase Insights"
        >
          <div className={styles.panelLayout}>
            <div className={styles.sideColumn}>
              <RecommendedActions phase={phase.data}>
                {panelActions}
              </RecommendedActions>
            </div>
            <div className={styles.dashboardPanel}>{dashboard}</div>
          </div>
        </div>
      ) : (
        <Box
          minHeight="0"
          borderBottom="none"
          display="flex"
          flexDirection="column"
          role="region"
          aria-label="Phase Insights"
        >
          {header}
          {dashboard}
        </Box>
      )}

      {inputResponseExport.modal}

      {isDownloadingPdf && (
        <div style={hiddenContainerStyle}>
          <PdfRenderModeProvider>
            <InsightsPdfContent phase={phase.data} />
          </PdfRenderModeProvider>
        </div>
      )}
    </>
  );
};

// Main component that wraps with PdfExportProvider
const AdminPhaseInsights = () => {
  const { projectId, phaseId } = useParams({ strict: false }) as {
    projectId: string;
    phaseId: string;
  };
  const { data: phase } = usePhase(phaseId);
  const localize = useLocalize();

  // Get phase title for filename, fallback to phaseId if not loaded yet
  const phaseTitle = phase?.data.attributes.title_multiloc;
  const phaseName = phaseTitle
    ? localize(phaseTitle) || `phase-${phaseId}`
    : `phase-${phaseId}`;

  const sanitizedPhaseName = getExportFilename(phaseName, phaseId);

  const participationMethod = phase?.data.attributes.participation_method;

  if (
    participationMethod === 'survey' ||
    participationMethod === 'information'
  ) {
    return (
      <Navigate
        to={
          participationMethod === 'survey'
            ? '/admin/projects/$projectId/phases/$phaseId/survey-results'
            : '/admin/projects/$projectId/phases/$phaseId/setup'
        }
        params={{ projectId, phaseId }}
        replace
      />
    );
  }

  return (
    <PdfExportProvider filename={sanitizedPhaseName}>
      <WordExportProvider
        filename={sanitizedPhaseName}
        title={phaseName}
        participationMethod={participationMethod}
      >
        <InsightsContent />
      </WordExportProvider>
    </PdfExportProvider>
  );
};

export default AdminPhaseInsights;
