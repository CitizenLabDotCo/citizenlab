// Libraries
import React, { PureComponent } from 'react';
import clHistory from 'utils/cl-router/history';

// Components
import GoBackButton from 'components/UI/GoBackButton';
import TabbedResource from 'components/admin/TabbedResource';

// Localisation
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from './messages';

// style
import styled from 'styled-components';
import { withRouter, WithRouterProps } from 'react-router';

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
  // projectFolder: GetProjectFolderChildProps;
}

interface State { }

export interface Props extends InputProps, DataProps { }

export class AdminProjectFolderEdition extends PureComponent<Props & InjectedIntlProps & InjectedLocalized & WithRouterProps, State> {

  goBack = () => {
    // todo why? keep ?
    // const currentPath = location.pathname;
    // const lastUrlSegment = currentPath.substr(currentPath.lastIndexOf('/') + 1);
    // const newPath = currentPath.replace(lastUrlSegment, '').replace(/\/$/, '');
    // const newLastUrlSegment = newPath.substr(newPath.lastIndexOf('/') + 1);
    //
    // if (newLastUrlSegment === this.props.params.projectFolderId) {
    clHistory.push('/admin/projectFolders');
    // } else {
    //   clHistory.push(newPath);
    // }
  }

  render() {
    const { projectFolderId } = this.props.params;
    const {  intl: { formatMessage }, localize } = this.props;
    const { children } = this.props;
    const tabbedProps = {
      resource: {
        title:  formatMessage(messages.newProjectFolder),
      },
      tabs: [
        {
          label: formatMessage(messages.projectFolderSettingsTab),
          url: `projects/projectFolders/${`${projectFolderId}` || 'new'}`,
          className: 'projectFolderSettings',
        },
        {// TODO handle tab nav for new ?
          label: formatMessage(messages.projectFolderProjectsTab),
          url: `projects/projectFolders/${projectFolderId}/projects`,
          className: 'projects',
        }
      ]
    };
    // <ActionsContainer>
    //   {!isNilOrError(projectFolder) &&
      //     <Button
      //       buttonStyle="cl-blue"
      //       icon="eye"
      //       id="to-projectFolder"
      //       linkTo={`/projectFolders/${projectFolder.attributes.slug}`}
      //     >
      //       <FormattedMessage {...messages.viewPublicProjectFolder} />
      //     </Button>
      //   }
      //   </ActionsContainer>

    return (
      <>
        <TopContainer>
          <GoBackButton onClick={this.goBack} />
        </TopContainer>
        <TabbedResource {...tabbedProps}>
          {children}
        </TabbedResource>
      </>
    );
  }
}

export default withRouter(injectIntl<Props & WithRouterProps>(injectLocalize(AdminProjectFolderEdition)));

// const Data = adopt<DataProps, InputProps & WithRouterProps>({
//   projectFolder: ({ params, render }) => <GetProjectFolder projectFolderId={params.projectFolderId}>{render}</GetProjectFolder>,
// });
//
// export default (inputProps: InputProps & WithRouterProps) => (
//   <Data {...inputProps}>
//     {dataProps => <AdminProjectFolderEditionWithHoCs {...inputProps} {...dataProps} />}
//   </Data>
// );
