// Libraries
import React, { memo } from 'react';
import clHistory from 'utils/cl-router/history';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'utils/withRouter';
import {
  adminProjectFoldersIndexPath,
  adminProjectFoldersSettingsPath,
  adminProjectFoldersPermissionsPath,
} from '../../utils/routeUtils';

// Services
import { isAdmin } from 'services/permissions/roles';

// Utils
import { isNilOrError } from 'utils/helperUtils';

// Components
import GoBackButton from 'components/UI/GoBackButton';
import TabbedResource from 'components/admin/TabbedResource';
import Button from 'components/UI/Button';
import { Outlet as RouterOutlet } from 'react-router-dom';

// Localisation
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Resources
import GetProjectFolder, {
  GetProjectFolderChildProps,
} from '../../resources/GetProjectFolder';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// style
import styled from 'styled-components';

// hooks
import useLocalize from 'hooks/useLocalize';

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
  projectFolder: GetProjectFolderChildProps;
  authUser: GetAuthUserChildProps;
}

export interface Props extends InputProps, DataProps {}

const AdminProjectFolderEdition = memo<
  Props & InjectedIntlProps & WithRouterProps
>(
  ({
    authUser,
    params: { projectFolderId },
    intl: { formatMessage },
    projectFolder,
  }) => {
    const localize = useLocalize();
    const goBack = () => {
      clHistory.push('/admin/projects');
    };

    let tabbedProps = {
      resource: {
        title: !isNilOrError(projectFolder)
          ? localize(projectFolder.attributes.title_multiloc)
          : '',
      },
      tabs: [
        {
          label: formatMessage(messages.projectFolderProjectsTab),
          url: adminProjectFoldersIndexPath(projectFolderId),
          name: 'projects',
        },
        {
          label: formatMessage(messages.projectFolderSettingsTab),
          url: adminProjectFoldersSettingsPath(projectFolderId),
          name: 'settings',
        },
      ],
    };

    if (authUser && isAdmin({ data: authUser })) {
      tabbedProps = {
        ...tabbedProps,
        tabs: tabbedProps.tabs.concat({
          label: formatMessage(messages.projectFolderPermissionsTab),
          url: adminProjectFoldersPermissionsPath(projectFolderId),
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
              linkTo={`/folders/${projectFolder.attributes.slug}`}
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
  }
);

const AdminProjectFolderEditionWithHoCs = injectIntl(AdminProjectFolderEdition);

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  authUser: <GetAuthUser />,
  projectFolder: ({ params, render }) => (
    <GetProjectFolder projectFolderId={params.projectFolderId}>
      {render}
    </GetProjectFolder>
  ),
});

export default withRouter((props: WithRouterProps) => (
  <Data {...props}>
    {(dataProps) => (
      <AdminProjectFolderEditionWithHoCs {...props} {...dataProps} />
    )}
  </Data>
));
