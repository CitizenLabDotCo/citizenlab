import React from 'react';

import { Box, Title, Tooltip } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Button from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';

const Header = () => {
  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });
  const { data: authUser } = useAuthUser();
  const userIsAdmin = isAdmin(authUser);
  const workspacesEnabled = useFeatureFlag({ name: 'workspaces' });

  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  return (
    <Box display="flex" justifyContent="space-between">
      <Box>
        <Title>
          <FormattedMessage {...messages.overviewPageTitle} />
        </Title>
      </Box>
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        className="intercom-admin-projects-new-project-folder-buttons"
      >
        {[null, 'calendar'].includes(tab) && (
          <Box>
            <Button
              data-cy="e2e-new-project-button"
              className="intercom-admin-projects-new-project-button"
              linkTo={'/admin/projects/new'}
              icon="plus-circle"
              buttonStyle="admin-dark"
            >
              <FormattedMessage {...messages.newProject} />
            </Button>
          </Box>
        )}
        {tab === 'folders' && isProjectFoldersEnabled && (
          <Tooltip
            content={
              <FormattedMessage {...messages.onlyAdminsCanCreateFolders} />
            }
            disabled={userIsAdmin}
          >
            <Box>
              <Button
                data-cy="e2e-new-project-folder-button"
                linkTo={'/admin/projects/folders/new'}
                icon="folder-add"
                disabled={!userIsAdmin}
                buttonStyle="admin-dark"
              >
                <FormattedMessage {...messages.createProjectFolder} />
              </Button>
            </Box>
          </Tooltip>
        )}
        {tab === 'workspaces' && userIsAdmin && workspacesEnabled && (
          <Box>
            <Button
              data-cy="e2e-new-workspace-button"
              className="intercom-admin-projects-new-workspace-button"
              linkTo={'/admin/projects/workspaces/new'}
              icon="plus-circle"
              buttonStyle="admin-dark"
            >
              <FormattedMessage {...messages.newWorkspace} />
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Header;
