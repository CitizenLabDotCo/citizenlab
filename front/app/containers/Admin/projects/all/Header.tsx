import React, { useState } from 'react';

import { Box, Title, Tooltip, Button } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ProjectCreationModeModal from 'components/admin/ProjectCreationModeModal';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';

const Header = () => {
  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });
  const { data: authUser } = useAuthUser();
  const userIsAdmin = isAdmin(authUser);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNewProjectClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleManualMode = () => {
    setIsModalOpen(false);
    clHistory.push('/admin/projects/new');
  };

  const handleAiProjectCreated = (projectId: string) => {
    setIsModalOpen(false);
    // Navigate to the created project's general settings page
    clHistory.push(`/admin/projects/${projectId}/general`);
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <Box>
          <Title>
            <FormattedMessage {...messages.overviewPageTitle} />
          </Title>
        </Box>
        <Box
          display="flex"
          justifyContent="flex-end"
          gap="12px"
          alignItems="center"
          className="intercom-admin-projects-new-project-folder-buttons"
        >
          {isProjectFoldersEnabled && (
            <Tooltip
              content={
                <FormattedMessage {...messages.onlyAdminsCanCreateFolders} />
              }
              disabled={userIsAdmin}
            >
              <Box>
                <ButtonWithLink
                  data-cy="e2e-new-project-folder-button"
                  linkTo={'/admin/projects/folders/new'}
                  buttonStyle="secondary-outlined"
                  icon="folder-add"
                  disabled={!userIsAdmin}
                >
                  <FormattedMessage {...messages.createProjectFolder} />
                </ButtonWithLink>
              </Box>
            </Tooltip>
          )}

          <Box>
            <Button
              data-cy="e2e-new-project-button"
              className="intercom-admin-projects-new-project-button"
              onClick={handleNewProjectClick}
              icon="plus-circle"
              buttonStyle="admin-dark"
            >
              <FormattedMessage {...messages.newProject} />
            </Button>
          </Box>
        </Box>
      </Box>

      <ProjectCreationModeModal
        open={isModalOpen}
        onClose={handleModalClose}
        onManualMode={handleManualMode}
        onAiProjectCreated={handleAiProjectCreated}
      />
    </>
  );
};

export default Header;
