import React, { useState } from 'react';

import {
  Box,
  Spinner,
  Button,
  Dropdown,
  colors,
  Text,
  Badge,
} from '@citizenlab/cl2-component-library';
import { stringify } from 'qs';

import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useAnalyses from 'api/analyses/useAnalyses';
import useUpdateAnalysis from 'api/analyses/useUpdateAnalysis';
import useRawCustomFields from 'api/custom_fields/useRawCustomFields';
import { IPhaseData } from 'api/phases/types';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import useProjectById from 'api/projects/useProjectById';
import useFormSubmissionCount from 'api/submission_count/useSubmissionCount';
import useDeleteSurveyResults from 'api/survey_results/useDeleteSurveyResults';
import { downloadSurveyResults } from 'api/survey_results/utils';

import useLocale from 'hooks/useLocale';

import projectFilesMessages from 'containers/Admin/projects/project/files/components/messages';
import useInputResponseExport from 'containers/Admin/projects/project/inputResponseExport/useInputResponseExport';

import DeleteModal from 'components/admin/SurveyDeleteModal/SurveyDeleteModal';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { getFormActionsConfig } from 'utils/configs/formActionsConfig/utils';
import { captureAllMapScreenshots } from 'utils/mapViewRegistry';

import messages from '../../messages';
import { usePdfExportContext } from '../../pdf/PdfExportContext';
import wordMessages from '../../word/messages';
import { useWordExportContext } from '../../word/WordExportContext';

import ExportDropdownItem from './components/ExportDropdownItem';

interface Props {
  phase: IPhaseData;
}

const SurveyActions = ({ phase }: Props) => {
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const projectId = phase.relationships.project.data.id;
  const phaseId = phase.id;
  const {
    openPdfExportModal,
    openXlsxExportModal,
    modal: responseExportModal,
  } = useInputResponseExport({ projectId, phaseId });

  const {
    downloadPdf,
    isDownloading: isDownloadingPdf,
    status: pdfStatus,
    progress: pdfProgress,
    skippedSections: pdfSkippedSections,
  } = usePdfExportContext();
  const {
    downloadWord,
    isDownloadingWord,
    exportStatus,
    exportProgress,
    captureWarnings,
  } = useWordExportContext();

  const { data: project } = useProjectById(projectId);
  const { mutate: updatePhase } = useUpdatePhase();

  const { mutate: deleteFormResults } = useDeleteSurveyResults();
  const { data: submissionCount } = useFormSubmissionCount({
    phaseId,
  });

  const { mutate: addAnalysis, isLoading: isAddLoading } = useAddAnalysis();
  const { mutate: updateAnalysis, isLoading: isUpdateLoading } =
    useUpdateAnalysis();
  const { data: analyses } = useAnalyses({ phaseId });
  const { data: inputCustomFields } = useRawCustomFields({
    projectId,
    phaseId,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDropdownOpened, setDropdownOpened] = useState(false);
  const [isDownloadingXlsx, setIsDownloadingXlsx] = useState(false);

  if (!project || !submissionCount) {
    return null;
  }

  const haveSubmissionsComeIn =
    submissionCount.data.attributes.totalSubmissions > 0;

  const { inputImporterLink } = getFormActionsConfig(
    project.data,
    updatePhase,
    phase
  );

  const inputCustomFieldsIds = inputCustomFields?.data.map(
    (customField) => customField.id
  );

  const mainAnalysis = analyses?.data.find(
    (analysis) => analysis.relationships.main_custom_field?.data === null
  );

  const analysisCustomFieldIds =
    mainAnalysis?.relationships.additional_custom_fields?.data.map(
      (field) => field.id
    ) || [];

  const customFieldsMatchAnalysisAdditionalFields =
    inputCustomFieldsIds &&
    analysisCustomFieldIds.length === inputCustomFieldsIds.length &&
    analysisCustomFieldIds.every((id) => inputCustomFieldsIds.includes(id));

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const deleteResults = () => {
    deleteFormResults(
      { phaseId },
      {
        onSuccess: () => {
          closeDeleteModal();
        },
      }
    );
  };

  const handleDownloadXlsx = async () => {
    try {
      setIsDownloadingXlsx(true);
      setDropdownOpened(false);
      await downloadSurveyResults(locale, phase);
    } catch (error) {
      // eslint-disable-next-line no-empty
    } finally {
      setIsDownloadingXlsx(false);
    }
  };

  const openAnalysis = (analysisId: string) => {
    clHistory.push(
      `/admin/projects/${projectId}/analysis/${analysisId}?${stringify({
        phase_id: phaseId,
      })}`
    );
  };

  const goToAnalysis = () => {
    if (mainAnalysis?.id) {
      if (!customFieldsMatchAnalysisAdditionalFields) {
        updateAnalysis(
          {
            additional_custom_field_ids: inputCustomFieldsIds,
            id: mainAnalysis.id,
          },
          {
            onSuccess: () => {
              openAnalysis(mainAnalysis.id);
            },
          }
        );
      } else {
        openAnalysis(mainAnalysis.id);
      }
    } else {
      addAnalysis(
        {
          phaseId,
          additionalCustomFields: inputCustomFieldsIds,
        },
        {
          onSuccess: (response) => openAnalysis(response.data.id),
        }
      );
    }
  };

  const toggleDropdown = () => {
    setDropdownOpened(!isDropdownOpened);
  };

  const closeDropdown = () => {
    setDropdownOpened(false);
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
    setDropdownOpened(false);
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

  const getWordStatusText = () => {
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

  const isAnyDownloading =
    isDownloadingXlsx || isDownloadingPdf || isDownloadingWord;
  const exportStatusText =
    (isDownloadingPdf && getPdfStatusText()) ||
    (isDownloadingWord && getWordStatusText()) ||
    null;
  const showCaptureWarning =
    !isAnyDownloading &&
    (pdfSkippedSections.length > 0 || captureWarnings.length > 0);

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        gap="4px"
        alignItems="flex-end"
        data-pdf-exclude="true"
      >
        <Box display="flex" alignItems="center" gap="8px">
          {isAnyDownloading && <Spinner size="24px" />}
          <ButtonWithLink
            linkTo={`/projects/${project.data.attributes.slug}/surveys/new?phase_id=${phaseId}`}
            buttonStyle="text"
            width="auto"
            openLinkInNewTab
          >
            {formatMessage(messages.newSubmission)}
          </ButtonWithLink>
          <ButtonWithLink
            {...inputImporterLink}
            icon="page"
            iconSize="20px"
            buttonStyle="secondary-outlined"
            width="auto"
          >
            {formatMessage(messages.import)}
          </ButtonWithLink>
          <Box position="relative">
            <Button
              icon="download"
              iconSize="20px"
              buttonStyle="secondary-outlined"
              width="auto"
              data-cy="e2e-survey-export-button"
              onClick={toggleDropdown}
            >
              {formatMessage(messages.exportButton)}
            </Button>
            <Dropdown
              opened={isDropdownOpened}
              onClickOutside={closeDropdown}
              className="dropdown"
              width="max-content"
              right="0px"
              top="45px"
              zIndex="10000"
              content={
                <Box style={{ whiteSpace: 'nowrap' }}>
                  <ExportDropdownItem
                    label={formatMessage(messages.exportResponsesToPdf)}
                    onClick={() => {
                      setDropdownOpened(false);
                      openPdfExportModal();
                    }}
                    data-cy="e2e-export-responses-pdf"
                  />
                  <ExportDropdownItem
                    label={formatMessage(messages.exportResponsesToXlsx)}
                    onClick={() => {
                      setDropdownOpened(false);
                      openXlsxExportModal();
                    }}
                    data-cy="e2e-export-responses-xlsx"
                  />
                  <ExportDropdownItem
                    label={formatMessage(messages.downloadInsightsPdf)}
                    onClick={async () => {
                      setDropdownOpened(false);
                      await captureAllMapScreenshots();
                      downloadPdf();
                    }}
                  />
                  <ExportDropdownItem
                    label={formatMessage(messages.downloadWord)}
                    onClick={async () => {
                      setDropdownOpened(false);
                      await captureAllMapScreenshots();
                      downloadWord();
                    }}
                    badge={
                      <Badge color={colors.coolGrey600} className="inverse">
                        {formatMessage(projectFilesMessages.beta)}
                      </Badge>
                    }
                  />
                  <ExportDropdownItem
                    label={`${formatMessage(
                      messages.downloadSurveyResults
                    )} (.xlsx)`}
                    onClick={handleDownloadXlsx}
                    data-cy="e2e-download-survey-results"
                  />
                </Box>
              }
            />
          </Box>
          <Button
            buttonStyle="primary"
            icon="stars"
            onClick={goToAnalysis}
            processing={isAddLoading || isUpdateLoading}
          >
            {formatMessage(messages.aiAnalysis)}
          </Button>
          {haveSubmissionsComeIn && (
            <Button
              buttonStyle="admin-dark-outlined"
              icon="delete"
              width="auto"
              onClick={openDeleteModal}
              data-cy="e2e-delete-survey-results"
            >
              {formatMessage(messages.deleteSurveyResults)}
            </Button>
          )}
        </Box>
        {exportStatusText && (
          <Text fontSize="s" color="textSecondary" m="0px">
            {exportStatusText}
          </Text>
        )}
        {showCaptureWarning && (
          <Text fontSize="s" color="orange500" m="0px">
            {formatMessage(wordMessages.exportCaptureWarning)}
          </Text>
        )}
      </Box>
      <DeleteModal
        showDeleteModal={showDeleteModal}
        closeDeleteModal={closeDeleteModal}
        deleteResults={deleteResults}
      />
      {responseExportModal}
    </>
  );
};

export default SurveyActions;
