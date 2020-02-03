// Libraries
import React, { PureComponent } from 'react';
import { reject } from 'lodash-es';
import clHistory from 'utils/cl-router/history';

// Components
import GoBackButton from 'components/UI/GoBackButton';
import Button from 'components/UI/Button';
import TabbedResource, { TabProps } from 'components/admin/TabbedResource';

// Localisation
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from './messages';

// tracks
import { trackEventByName } from 'utils/analytics';

// style
import styled from 'styled-components';
import { adopt } from 'react-adopt';
import GetFeatureFlag from 'resources/GetFeatureFlag';
// import GetFolder, { GetFolderChildProps } from 'resources/GetFolder';
import { isNilOrError } from 'utils/helperUtils';
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

const ActionsContainer = styled.div`
  display: flex;

  & > *:not(:last-child) {
    margin-right: 15px;
  }
`;

export interface InputProps { }

interface DataProps {
  // folder: GetFolderChildProps;
}

interface State { }

export interface Props extends InputProps, DataProps { }

export class AdminFolderEdition extends PureComponent<Props & InjectedIntlProps & InjectedLocalized & WithRouterProps, State> {

  goBack = () => {
    // todo why? keep ?
    // const currentPath = location.pathname;
    // const lastUrlSegment = currentPath.substr(currentPath.lastIndexOf('/') + 1);
    // const newPath = currentPath.replace(lastUrlSegment, '').replace(/\/$/, '');
    // const newLastUrlSegment = newPath.substr(newPath.lastIndexOf('/') + 1);
    //
    // if (newLastUrlSegment === this.props.params.folderId) {
    clHistory.push('/admin/folders');
    // } else {
    //   clHistory.push(newPath);
    // }
  }

  render() {
    const { folderId } = this.props.params;
    const {  intl: { formatMessage }, localize } = this.props;
    const { children } = this.props;
    const tabbedProps = {
      resource: {
        title:  formatMessage(messages.newFolder),
      },
      tabs: [
        {
          label: formatMessage(messages.folderSettingsTab),
          url: `projects/folders/${`${folderId}/edit` || 'new'}`,
          className: 'folderSettings',
        },
        {// TODO handle tab nav for new ?
          label: formatMessage(messages.folderProjectsTab),
          url: `projects/folders/${folderId}/projects`,
          className: 'projects',
        }
      ]
    };
    // <ActionsContainer>
    //   {!isNilOrError(folder) &&
      //     <Button
      //       buttonStyle="cl-blue"
      //       icon="eye"
      //       id="to-folder"
      //       linkTo={`/folders/${folder.attributes.slug}`}
      //     >
      //       <FormattedMessage {...messages.viewPublicFolder} />
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

export default withRouter(injectIntl<Props & WithRouterProps>(injectLocalize(AdminFolderEdition)));

// const Data = adopt<DataProps, InputProps & WithRouterProps>({
//   folder: ({ params, render }) => <GetFolder folderId={params.folderId}>{render}</GetFolder>,
// });
//
// export default (inputProps: InputProps & WithRouterProps) => (
//   <Data {...inputProps}>
//     {dataProps => <AdminFolderEditionWithHoCs {...inputProps} {...dataProps} />}
//   </Data>
// );
