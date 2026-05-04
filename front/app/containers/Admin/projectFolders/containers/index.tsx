import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import useProjectFolderById from 'api/project_folders/useProjectFolderById';

import useLocalize from 'hooks/useLocalize';

import TabbedResource, {
  Props as TabbedResourceProps,
} from 'components/admin/TabbedResource';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { userModeratesFolder } from 'utils/permissions/rules/projectFolderPermissions';
import { Outlet as RouterOutlet, useParams } from 'utils/router';

import messages from './messages';

const AdminProjectFolderEdition = () => {
  const { projectFolderId } = useParams({ strict: false });
  const { data: projectFolder } = useProjectFolderById(projectFolderId);
  const { data: authUser } = useAuthUser();
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  if (!authUser || !projectFolder || !projectFolderId) return null;

  if (
    !userModeratesFolder(
      authUser,
      projectFolderId,
      projectFolder.data.attributes.space_id
    )
  ) {
    return null;
  }

  const goBack = () => {
    clHistory.push('/admin/projects');
  };

  const tabbedProps: Omit<TabbedResourceProps, 'children'> = {
    resource: {
      title: localize(projectFolder.data.attributes.title_multiloc),
    },
    tabs: [
      {
        label: formatMessage(messages.projectFolderProjectsTab),
        url: `/admin/projects/folders/${projectFolderId}/projects`,
        name: 'projects',
      },
      {
        label: formatMessage(messages.projectFolderSettingsTab),
        url: `/admin/projects/folders/${projectFolderId}/settings`,
        name: 'settings',
      },
      {
        label: formatMessage(messages.projectFolderPermissionsTab),
        url: `/admin/projects/folders/${projectFolderId}/permissions`,
        name: 'permissions',
      },
    ],
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <GoBackButton onClick={goBack} />
        <ButtonWithLink
          buttonStyle="admin-dark"
          icon="eye"
          id="to-projectFolder"
          linkTo={`/folders/${projectFolder.data.attributes.slug}`}
        >
          <FormattedMessage {...messages.viewPublicProjectFolder} />
        </ButtonWithLink>
      </Box>
      <TabbedResource {...tabbedProps}>
        <RouterOutlet />
      </TabbedResource>
    </>
  );
};

export default AdminProjectFolderEdition;
