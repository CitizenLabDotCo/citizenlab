import React from 'react';

import { Box, Title, Tooltip } from '@citizenlab/cl2-component-library';

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

  return (
    <Box display="flex" justifyContent="space-between">
      <Box>
        <Title color="primary">
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
              <Button
                data-cy="e2e-new-project-folder-button"
                linkTo={'/admin/projects/folders/new'}
                buttonStyle="secondary-outlined"
                icon="folder-add"
                disabled={!userIsAdmin}
              >
                <FormattedMessage {...messages.createProjectFolder} />
              </Button>
            </Box>
          </Tooltip>
        )}

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
      </Box>
    </Box>
  );
};

export default Header;
