import React, { useState } from 'react';

import { Box, Title, Toggle, Spinner } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';
import usePhase from 'api/phases/usePhase';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import useFormSubmissionCount from 'api/submission_count/useSubmissionCount';
import useDeleteSurveyResults from 'api/survey_results/useDeleteSurveyResults';
import { downloadSurveyResults } from 'api/survey_results/utils';

import useLocale from 'hooks/useLocale';

import UserFieldsToggle from 'containers/Admin/communityMonitor/components/Settings/components/UserFieldsToggle';

import DeleteModal from 'components/admin/SurveyDeleteModal/SurveyDeleteModal';
import DropdownSettings from 'components/admin/SurveyDropdownSettings/DropdownSettings';
import EditWarningModal from 'components/admin/SurveyEditWarningModal';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { getFormActionsConfig } from 'utils/configs/formActionsConfig/utils';

import ViewSurveyButton from '../../../ViewSurveyButton';
import messages from '../../messages';
import AnonymousToggle from '../AnonymousToggle';

const SurveySettings = () => {
  const locale = useLocale();
  const { formatMessage } = useIntl();

  // Project and phase hooks
  const { data: project } = useCommunityMonitorProject({});
  const phaseId = project?.data.relationships.current_phase?.data?.id;
  const { data: phase } = usePhase(phaseId);
  const { mutate: updatePhase } = useUpdatePhase();

  // Form hooks
  const { mutate: deleteFormResults } = useDeleteSurveyResults();
  const { data: submissionCount } = useFormSubmissionCount({
    phaseId,
  });

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditWarningModal, setShowEditWarningModal] = useState(false);

  // Other states
  const [isDropdownOpened, setDropdownOpened] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!project || !phase || !submissionCount) {
    return null;
  }

  // Form-related variables
  const haveSubmissionsComeIn =
    submissionCount.data.attributes.totalSubmissions > 0;

  // Variables from form config
  const { postingEnabled, togglePostingEnabled, inputImporterLink } =
    getFormActionsConfig(project.data, updatePhase, phase.data);
  const editFormLink: RouteType = `/admin/community-monitor/projects/${project.data.id}/phases/${phase.data.id}/survey/edit`;

  // Functions to handle modal states
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  // Functions to handle results
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
    <Box>
      <Box width="100%">
        <Box
          width="100%"
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Title variant="h2" color="primary">
            {formatMessage(messages.survey)}
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
            <ButtonWithLink
              linkTo={inputImporterLink}
              icon="page"
              iconSize="20px"
              buttonStyle="secondary-outlined"
              width="auto"
              mr="8px"
            >
              {formatMessage(messages.importInputs)}
            </ButtonWithLink>
            <ViewSurveyButton />
            <ButtonWithLink
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
            </ButtonWithLink>
            <DropdownSettings
              haveSubmissionsComeIn={haveSubmissionsComeIn}
              handleDownloadResults={handleDownloadResults}
              setDropdownOpened={setDropdownOpened}
              isDropdownOpened={isDropdownOpened}
              setShowDeleteModal={setShowDeleteModal}
            />
          </Box>
        </Box>
        <EditWarningModal
          editFormLink={editFormLink}
          showEditWarningModal={showEditWarningModal}
          setShowEditWarningModal={setShowEditWarningModal}
          handleDownloadResults={handleDownloadResults}
        />
      </Box>
      <DeleteModal
        showDeleteModal={showDeleteModal}
        closeDeleteModal={closeDeleteModal}
        deleteResults={deleteResults}
      />

      {phaseId && (
        <Box mt="20px">
          <AnonymousToggle phaseId={phaseId} />
          <UserFieldsToggle phaseId={phaseId} />
        </Box>
      )}
    </Box>
  );
};

export default SurveySettings;
