// Libraries
import React from 'react';
import clHistory from 'utils/cl-router/history';

// Services
import { isAdmin } from 'utils/permissions/roles';

// Components
import GoBackButton from 'components/UI/GoBackButton';
import TabbedResource from 'components/admin/TabbedResource';
import Button from 'components/UI/Button';
import { Outlet as RouterOutlet, useParams } from 'react-router-dom';

// Localisation
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';

// hooks
import useLocalize from 'hooks/useLocalize';
import useProjectFolderById from 'api/project_folders/useProjectFolderById';
import useAuthUser from 'api/me/useAuthUser';

const TopContainer = styled.div`
  width: 100%;
  margin-top: -5px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

const AdminProjectFolderEdition = () => {
  const { projectFolderId } = useParams() as { projectFolderId: string };
  const { data: projectFolder } = useProjectFolderById(projectFolderId);
  const { data: authUser } = useAuthUser();
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  if (!authUser || !projectFolder) return null;

  const goBack = () => {
    clHistory.push('/admin/projects');
  };

  let tabbedProps = {
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
    ],
  };

  if (isAdmin({ data: authUser.data })) {
    tabbedProps = {
      ...tabbedProps,
      tabs: tabbedProps.tabs.concat({
        label: formatMessage(messages.projectFolderPermissionsTab),
        url: `/admin/projects/folders/${projectFolderId}/permissions`,
        name: 'permissions',
      }),
    };
  }

  return (
    <>
      <TopContainer>
        <GoBackButton onClick={goBack} />
        <Button
          buttonStyle="cl-blue"
          icon="eye"
          id="to-projectFolder"
          linkTo={`/folders/${projectFolder.data.attributes.slug}`}
        >
          <FormattedMessage {...messages.viewPublicProjectFolder} />
        </Button>
      </TopContainer>
      <TabbedResource {...tabbedProps}>
        <RouterOutlet />
      </TabbedResource>
    </>
  );
};

export default AdminProjectFolderEdition;
