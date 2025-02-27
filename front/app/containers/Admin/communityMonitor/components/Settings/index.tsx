import React, { useState } from 'react';

import { Box, Title, Toggle, Spinner } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import usePhase from 'api/phases/usePhase';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import useProjectById from 'api/projects/useProjectById';
import useFormSubmissionCount from 'api/submission_count/useSubmissionCount';
import { downloadSurveyResults } from 'api/survey_results/utils';

import useLocale from 'hooks/useLocale';

import EditWarningModal from 'containers/Admin/projects/project/nativeSurvey/EditWarningModal';
import { getFormActionsConfig } from 'containers/Admin/projects/project/nativeSurvey/utils';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import DeleteSubmissionsModal from './components/DeleteSubmissionsModal';
import DropdownSettings from './components/DropdownSettings';
import EditSurveyButton from './components/EditSurveyButton';
import InputImportButtonLink from './components/InputImportButtonLink';
import messages from './messages';

const Settings = () => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();
  const projectId =
    appConfiguration?.data.attributes.settings.community_monitor?.project_id;

  const { data: project } = useProjectById(projectId);
  const phaseId = project?.data.relationships.current_phase?.data?.id;

  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditWarningModal, setShowEditWarningModal] = useState(false);

  const { data: phase } = usePhase(phaseId);
  const locale = useLocale();
  const { mutate: updatePhase } = useUpdatePhase();
  const { data: submissionCount } = useFormSubmissionCount({
    phaseId,
  });

  if (!project || isNilOrError(locale) || !phase || !submissionCount) {
    return null;
  }

  const { downloadExcelLink, postingEnabled, togglePostingEnabled } =
    getFormActionsConfig(project.data, updatePhase, phase.data);

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

  const haveSubmissionsComeIn =
    submissionCount.data.attributes.totalSubmissions > 0;

  if (isDownloading) {
    return (
      <Box width="100%" height="100%" display="flex" alignItems="center">
        <Spinner />
      </Box>
    );
  }

  return (
    <Box mt="48px">
      <h1>Settings</h1>
      <Box
        width="100%"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Title variant="h3" color="primary">
          {formatMessage(messages.settings)}
        </Title>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Box mr="16px">
            <Toggle
              checked={postingEnabled}
              label={'Open for responses'}
              onChange={() => {
                togglePostingEnabled();
              }}
            />
          </Box>
          <InputImportButtonLink project={project.data} phase={phase.data} />
          <ButtonWithLink
            linkTo={`/admin/community-monitor/projects/${projectId}/phases/${phaseId}/survey/edit`}
            icon="eye"
            iconSize="20px"
            buttonStyle="secondary-outlined"
            width="auto"
            openLinkInNewTab
            mr="8px"
          >
            View Survey
          </ButtonWithLink>
          <EditSurveyButton
            projectId={projectId}
            phaseId={phaseId}
            haveSubmissionsComeIn={haveSubmissionsComeIn}
            setShowEditWarningModal={setShowEditWarningModal}
          />
          <DropdownSettings
            downloadExcelLink={downloadExcelLink}
            haveSubmissionsComeIn={haveSubmissionsComeIn}
            setShowDeleteModal={setShowDeleteModal}
            showDeleteModal={showDeleteModal}
            projectId={projectId}
            phaseId={phaseId}
            handleDownloadResults={handleDownloadResults}
          />
        </Box>
        <EditWarningModal
          editFormLink={`/admin/community-monitor/projects/${projectId}/phases/${phaseId}/survey/edit`}
          showEditWarningModal={showEditWarningModal}
          setShowEditWarningModal={setShowEditWarningModal}
          handleDownloadResults={handleDownloadResults}
        />
        <DeleteSubmissionsModal
          phaseId={phaseId}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
        />
      </Box>
    </Box>
  );
};

export default Settings;
