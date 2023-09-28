// Libraries
import React, { memo } from 'react';
import clHistory from 'utils/cl-router/history';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// Services
import { isAdmin } from 'utils/permissions/roles';

// Utils
import { isNilOrError } from 'utils/helperUtils';

// Components
import GoBackButton from 'components/UI/GoBackButton';
import TabbedResource from 'components/admin/TabbedResource';
import Button from 'components/UI/Button';
import { Outlet as RouterOutlet } from 'react-router-dom';

// Localisation
import { WrappedComponentProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// style
import styled from 'styled-components';

// hooks
import useLocalize from 'hooks/useLocalize';
import useProjectFolderById from 'api/project_folders/useProjectFolderById';

const TopContainer = styled.div`
  width: 100%;
  margin-top: -5px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

export interface InputProps {}

interface DataProps {
  authUser: GetAuthUserChildProps;
}

export interface Props extends InputProps, DataProps {}

const AdminProjectFolderEdition = memo<
  Props & WrappedComponentProps & WithRouterProps
>(({ authUser, params: { projectFolderId }, intl: { formatMessage } }) => {
  const { data: projectFolder } = useProjectFolderById(projectFolderId);
  const localize = useLocalize();
  const goBack = () => {
    clHistory.push('/admin/projects');
  };

  let tabbedProps = {
    resource: {
      title: !isNilOrError(projectFolder)
        ? localize(projectFolder.data.attributes.title_multiloc)
        : '',
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

  if (authUser && isAdmin({ data: authUser })) {
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
        {!isNilOrError(projectFolder) && (
          <Button
            buttonStyle="cl-blue"
            icon="eye"
            id="to-projectFolder"
            linkTo={`/folders/${projectFolder.data.attributes.slug}`}
          >
            <FormattedMessage {...messages.viewPublicProjectFolder} />
          </Button>
        )}
      </TopContainer>
      <TabbedResource {...tabbedProps}>
        <RouterOutlet />
      </TabbedResource>
    </>
  );
});

const AdminProjectFolderEditionWithHoCs = injectIntl(AdminProjectFolderEdition);

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  authUser: <GetAuthUser />,
});

export default withRouter((props: WithRouterProps) => (
  <Data {...props}>
    {(dataProps) => (
      <AdminProjectFolderEditionWithHoCs {...props} {...dataProps} />
    )}
  </Data>
));
