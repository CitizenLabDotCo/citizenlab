import React from 'react';

import { Box, Title, Tooltip } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Button from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import { isAdmin, isSpaceModerator } from 'utils/permissions/roles';

import messages from './messages';

const Header = () => {
  const { data: authUser } = useAuthUser();
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });

  const userIsAdmin = isAdmin(authUser);
  const userIsSpaceModerator = isSpaceModerator(authUser);

  const userCanAddFolders = userIsAdmin || userIsSpaceModerator;

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
        gap="12px"
        alignItems="center"
        className="intercom-admin-projects-new-project-folder-buttons"
      >
        {spacesEnabled && (
          <Tooltip
            content={
              <FormattedMessage {...messages.onlyAdminsCanCreateSpaces} />
            }
            disabled={userIsAdmin}
          >
            <Box>
              <Button
                data-cy="e2e-new-space-button"
                className="intercom-admin-projects-new-space-button"
                to="/admin/projects/spaces/new"
                buttonStyle="secondary-outlined"
                icon="spaces"
                iconSize="20px"
                disabled={!userIsAdmin}
              >
                <FormattedMessage {...messages.newSpace} />
              </Button>
            </Box>
          </Tooltip>
        )}
        <Tooltip
          content={
            <FormattedMessage
              {...(spacesEnabled
                ? messages.onlyAdminsAndSpaceManagersCanCreateFolders
                : messages.onlyAdminsCanCreateFolders)}
            />
          }
          disabled={userCanAddFolders}
        >
          <Box>
            <Button
              data-cy="e2e-new-project-folder-button"
              to="/admin/projects/folders/new"
              buttonStyle="secondary-outlined"
              icon="folder-add"
              disabled={!userCanAddFolders}
            >
              <FormattedMessage {...messages.createProjectFolder} />
            </Button>
          </Box>
        </Tooltip>
        <Box>
          <Button
            data-cy="e2e-new-project-button"
            className="intercom-admin-projects-new-project-button"
            to="/admin/projects/new"
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
