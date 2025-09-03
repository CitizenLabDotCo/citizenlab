import React from 'react';

import { Outlet as RouterOutlet, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ITab } from 'typings';

import useAuthUser from 'api/me/useAuthUser';
import useProjectFolderById from 'api/project_folders/useProjectFolderById';

import useLocalize from 'hooks/useLocalize';

import TabbedResource from 'components/admin/TabbedResource';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';

const TopContainer = styled.div`
  width: 100%;
  margin-top: -5px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

type TabbedPropsType = {
  resource: {
    title: string;
  };
  tabs: ITab[];
};

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

  let tabbedProps: TabbedPropsType = {
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

  if (isAdmin(authUser)) {
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
        <ButtonWithLink
          buttonStyle="admin-dark"
          icon="eye"
          id="to-projectFolder"
          linkTo={`/folders/${projectFolder.data.attributes.slug}`}
        >
          <FormattedMessage {...messages.viewPublicProjectFolder} />
        </ButtonWithLink>
      </TopContainer>
      <TabbedResource {...tabbedProps}>
        <RouterOutlet />
      </TabbedResource>
    </>
  );
};

export default AdminProjectFolderEdition;
