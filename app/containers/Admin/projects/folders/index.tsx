// Libraries
import React, { PureComponent } from 'react';
import clHistory from 'utils/cl-router/history';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';

// Utils
import { isNilOrError } from 'utils/helperUtils';

// Components
import GoBackButton from 'components/UI/GoBackButton';
import TabbedResource from 'components/admin/TabbedResource';
import Button from 'components/UI/Button';

// Localisation
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from './messages';

// Resources
import GetProjectFolder, {
  GetProjectFolderChildProps,
} from 'resources/GetProjectFolder';

// style
import styled from 'styled-components';

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
}

interface State {}

export interface Props extends InputProps, DataProps {}

export class AdminProjectFolderEdition extends PureComponent<
  Props & InjectedIntlProps & InjectedLocalized & WithRouterProps,
  State
> {
  goBack = () => {
    clHistory.push('/admin/projects');
  };

  render() {
    const { projectFolderId } = this.props.params;
    const {
      intl: { formatMessage },
      localize,
      projectFolder,
      children,
    } = this.props;
    const tabbedProps = {
      resource: {
        title: !isNilOrError(projectFolder)
          ? localize(projectFolder.attributes.title_multiloc)
          : '',
      },
      tabs: [
        {
          label: formatMessage(messages.projectFolderProjectsTab),
          url: `/admin/projects/folders/${projectFolderId}`,
        },
        {
          label: formatMessage(messages.projectFolderSettingsTab),
          url: `/admin/projects/folders/${projectFolderId}/settings`,
        },
      ],
    };

    return (
      <>
        <TopContainer>
          <GoBackButton onClick={this.goBack} />
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
        <TabbedResource {...tabbedProps}>{children}</TabbedResource>
      </>
    );
  }
}

const AdminProjectFolderEditionWithHoCs = withRouter(
  injectIntl<Props & WithRouterProps>(injectLocalize(AdminProjectFolderEdition))
);

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  projectFolder: ({ params, render }) => (
    <GetProjectFolder projectFolderId={params.projectFolderId}>
      {render}
    </GetProjectFolder>
  ),
});

export default (inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <AdminProjectFolderEditionWithHoCs {...inputProps} {...dataProps} />
    )}
  </Data>
);
