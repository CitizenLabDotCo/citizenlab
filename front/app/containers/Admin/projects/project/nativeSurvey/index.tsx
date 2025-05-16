import React, { useState } from 'react';

import { Box, Spinner, Title, Toggle } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import usePhase from 'api/phases/usePhase';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import useProjectById from 'api/projects/useProjectById';
import useFormSubmissionCount from 'api/submission_count/useSubmissionCount';
import useDeleteSurveyResults from 'api/survey_results/useDeleteSurveyResults';
import { downloadSurveyResults } from 'api/survey_results/utils';

import useLocale from 'hooks/useLocale';

import FormResults from 'components/admin/FormResults';
import DeleteModal from 'components/admin/SurveyDeleteModal/SurveyDeleteModal';
import DropdownSettings from 'components/admin/SurveyDropdownSettings/DropdownSettings';
import Button from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import { getFormActionsConfig } from 'utils/configs/formActionsConfig/utils';

import AnalysisBanner from './AnalysisBanner';
import CopySurveyModal from './CopySurveyModal';
import messages from './messages';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
        <AnalysisBanner />
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
              buttonStyle="primary"
              width="auto"
              openLinkInNewTab
              mr="8px"
            >
              {formatMessage(messages.viewSurveyText)}
            </Button>
            <DropdownSettings
              haveSubmissionsComeIn={haveSubmissionsComeIn}
              setShowCopySurveyModal={setShowCopySurveyModal}
              handleDownloadResults={handleDownloadResults}
              setDropdownOpened={setDropdownOpened}
              isDropdownOpened={isDropdownOpened}
              setShowDeleteModal={setShowDeleteModal}
            />
          </Box>
        </Box>
        <FormResults />
        <CopySurveyModal
          editFormLink={editFormLink}
          showCopySurveyModal={showCopySurveyModal}
          setShowCopySurveyModal={setShowCopySurveyModal}
          surveyFormPersisted={surveyFormPersisted}
        />
      </Box>
      <DeleteModal
        showDeleteModal={showDeleteModal}
        closeDeleteModal={closeDeleteModal}
        deleteResults={deleteResults}
      />
    </>
  );
};

export default Forms;
