import React from 'react';

import { Box, Title, Tooltip } from '@citizenlab/cl2-component-library';
import { useSearch } from '@tanstack/react-router';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Button from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import messages from './messages';
import NewProjectButton from './NewProjectButton';

const Header = () => {
  const searchParams = useSearch({
    from: '/$locale/admin/projects/',
  });
  const tab = searchParams.tab;
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });
  const userCanAddFolders = usePermission({
    item: 'project_folder',
    action: 'create',
  });
  const userCanAddSpaces = usePermission({ item: 'space', action: 'create' });

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
        {tab === undefined && (
          <Box>
            <NewProjectButton />
          </Box>
        )}
        {tab === 'folders' && (
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
                buttonStyle="admin-dark"
                icon="folder-add"
                disabled={!userCanAddFolders}
              >
                <FormattedMessage {...messages.createProjectFolder} />
              </Button>
            </Box>
          </Tooltip>
        )}
        {tab === 'spaces' && spacesEnabled && (
          <Tooltip
            content={
              <FormattedMessage {...messages.onlyAdminsCanCreateSpaces} />
            }
            disabled={userCanAddSpaces}
          >
            <Box>
              <Button
                data-cy="e2e-new-space-button"
                className="intercom-admin-projects-new-space-button"
                to="/admin/projects/spaces/new"
                buttonStyle="admin-dark"
                icon="spaces"
                iconSize="20px"
                disabled={!userCanAddSpaces}
              >
                <FormattedMessage {...messages.newSpace} />
              </Button>
            </Box>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default Header;
