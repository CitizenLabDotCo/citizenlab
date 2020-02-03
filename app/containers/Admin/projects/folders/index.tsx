// Libraries
import React, { PureComponent } from 'react';
import clHistory from 'utils/cl-router/history';

// Components
import GoBackButton from 'components/UI/GoBackButton';
import TabbedResource from 'components/admin/TabbedResource';

// Localisation
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from './messages';

// style
import styled from 'styled-components';
import { withRouter, WithRouterProps } from 'react-router';
import { adopt } from 'react-adopt';
import GetProjectFolder, { GetProjectFolderChildProps } from 'resources/GetProjectFolder';
import { isNilOrError } from 'utils/helperUtils';
import Button from 'components/UI/Button';

const TopContainer = styled.div`
  width: 100%;
  margin-top: -5px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

export interface InputProps { }

interface DataProps {
  projectFolder: GetProjectFolderChildProps;
}

interface State { }

export interface Props extends InputProps, DataProps { }

export class AdminProjectFolderEdition extends PureComponent<Props & InjectedIntlProps & InjectedLocalized & WithRouterProps, State> {

  goBack = () => {
    clHistory.push('/admin/projects');
  }

  render() {
    const { projectFolderId } = this.props.params;
    const { intl: { formatMessage }, localize, projectFolder } = this.props;
    const { children } = this.props;
    const tabbedProps = {
      resource: {
        title: !isNilOrError(projectFolder) ? localize(projectFolder.attributes.title_multiloc) : '',
      },
      tabs: [
        {
          label: formatMessage(messages.projectFolderSettingsTab),
          url: `projects/folders/${`${projectFolderId}` || 'new'}`,
          className: 'projectFolderSettings',
        },
        {
          label: formatMessage(messages.projectFolderProjectsTab),
          url: `projects/folders/${projectFolderId}/projects`,
          className: 'projects',
        }
      ]
    };

    return (
      <>
        <TopContainer>
          <GoBackButton onClick={this.goBack} />
          {!isNilOrError(projectFolder) &&
            <Button
              buttonStyle="cl-blue"
              icon="eye"
              id="to-projectFolder"
              linkTo={`/folders/${projectFolder.attributes.slug}`}
            >
              <FormattedMessage {...messages.viewPublicProjectFolder} />
            </Button>
          }
        </TopContainer>
        <TabbedResource {...tabbedProps}>
          {children}
        </TabbedResource>
      </>
    );
  }
}

const AdminProjectFolderEditionWithHoCs = withRouter(injectIntl<Props & WithRouterProps>(injectLocalize(AdminProjectFolderEdition)));

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  projectFolder: ({ params, render }) => <GetProjectFolder projectFolderId={params.projectFolderId}>{render}</GetProjectFolder>,
});

export default (inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <AdminProjectFolderEditionWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
