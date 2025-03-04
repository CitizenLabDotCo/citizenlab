import React, { useState } from 'react';

import { Box, Title, Toggle, Spinner } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import usePhase from 'api/phases/usePhase';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import useProjectById from 'api/projects/useProjectById';
import useFormSubmissionCount from 'api/submission_count/useSubmissionCount';
import useDeleteSurveyResults from 'api/survey_results/useDeleteSurveyResults';
import { downloadSurveyResults } from 'api/survey_results/utils';

import useLocale from 'hooks/useLocale';

import PDFExportModal, {
  FormValues,
} from 'containers/Admin/projects/components/PDFExportModal';

import DeleteModal from 'components/admin/SurveyDeleteModal/SurveyDeleteModal';
import DropdownSettings from 'components/admin/SurveyDropdownSettings/DropdownSettings';
import EditWarningModal from 'components/admin/SurveyEditWarningModal';
import Button from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { getFormActionsConfig } from 'utils/configs/formActionsConfig/utils';

import CopySurveyModal from './CopySurveyModal';
import FormResults from './FormResults';
import messages from './messages';
import { saveSurveyAsPDF } from './saveSurveyAsPDF';

const Forms = () => {
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  // Project and phase hooks
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);
  const { mutate: updatePhase } = useUpdatePhase();

  // Form hooks
  const { mutate: deleteFormResults } = useDeleteSurveyResults();
  const { data: submissionCount } = useFormSubmissionCount({
    phaseId,
  });

  // Modal states
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditWarningModal, setShowEditWarningModal] = useState(false);
  const [showCopySurveyModal, setShowCopySurveyModal] = useState(false);

  // Other states
  const [isDropdownOpened, setDropdownOpened] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!project || !phase || !submissionCount) {
    return null;
  }

  // Form-related variables
  const haveSubmissionsComeIn =
    submissionCount.data.attributes.totalSubmissions > 0;
  const surveyFormPersisted =
    phase.data.attributes.custom_form_persisted || false;

  // Variables from form config
  const {
    downloadPdfLink,
    downloadExcelLink,
    postingEnabled,
    togglePostingEnabled,
    editFormLink,
    inputImporterLink,
  } = getFormActionsConfig(project.data, updatePhase, phase.data);

  // Functions to handle modal states
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  // Function to handle result deletion
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

  // Functions to handle downloads
  const handleDownloadResults = async () => {
    try {
      setIsDownloading(true);
      await downloadSurveyResults(locale, phase.data);
    } catch (error) {
      // Not handling errors for now
    } finally {
      setIsDownloading(false);
    }
  };
  const handleExportPDF = async ({ personal_data }: FormValues) => {
    await saveSurveyAsPDF({
      downloadPdfLink,
      locale,
      personal_data,
    });
  };

  if (isDownloading) {
    return (
      <Box width="100%" height="100%" display="flex" alignItems="center">
        <Spinner />
      </Box>
    );
  }

  return (
    <>
      <Box width="100%">
        <Box
          width="100%"
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Title variant="h3" color="primary">
            {formatMessage(messages.surveyResponses)}
          </Title>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Box mr="16px">
              <Toggle
                checked={postingEnabled}
                label={formatMessage(messages.openForResponses)}
                onChange={() => {
                  togglePostingEnabled();
                }}
              />
            </Box>
            <Button
              linkTo={inputImporterLink}
              icon="page"
              iconSize="20px"
              buttonStyle="secondary-outlined"
              width="auto"
              mr="8px"
            >
              {formatMessage(messages.importInputs)}
            </Button>
            <Button
              linkTo={`/projects/${project.data.attributes.slug}/surveys/new?phase_id=${phase.data.id}`}
              icon="eye"
              iconSize="20px"
              buttonStyle="secondary-outlined"
              width="auto"
              openLinkInNewTab
              mr="8px"
            >
              {formatMessage(messages.viewSurveyText)}
            </Button>
            <Button
              icon="edit"
              iconSize="20px"
              buttonStyle="admin-dark"
              width="auto"
              onClick={() => {
                haveSubmissionsComeIn
                  ? setShowEditWarningModal(true)
                  : clHistory.push(editFormLink);
              }}
              data-cy="e2e-edit-survey-content"
            >
              {formatMessage(messages.editSurvey)}
            </Button>
            <DropdownSettings
              haveSubmissionsComeIn={haveSubmissionsComeIn}
              setShowCopySurveyModal={setShowCopySurveyModal}
              handleDownloadResults={handleDownloadResults}
              setExportModalOpen={setExportModalOpen}
              setDropdownOpened={setDropdownOpened}
              isDropdownOpened={isDropdownOpened}
              downloadExcelLink={downloadExcelLink}
              setShowDeleteModal={setShowDeleteModal}
            />
          </Box>
        </Box>
        <FormResults />
        <EditWarningModal
          editFormLink={editFormLink}
          showEditWarningModal={showEditWarningModal}
          setShowEditWarningModal={setShowEditWarningModal}
          handleDownloadResults={handleDownloadResults}
        />
        <CopySurveyModal
          editFormLink={editFormLink}
          showCopySurveyModal={showCopySurveyModal}
          setShowCopySurveyModal={setShowCopySurveyModal}
          surveyFormPersisted={surveyFormPersisted}
        />
      </Box>
      <PDFExportModal
        open={exportModalOpen}
        formType="survey"
        onClose={() => setExportModalOpen(false)}
        onExport={handleExportPDF}
      />
      <DeleteModal
        showDeleteModal={showDeleteModal}
        closeDeleteModal={closeDeleteModal}
        deleteResults={deleteResults}
      />
    </>
  );
};

export default Forms;
