import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';
import Button from 'components/UI/Button';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// styles
import styled from 'styled-components';

const TopContainer = styled.div`
  width: 100%;
  margin-top: -5px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;
`;

const ActionsContainer = styled.div`
  display: flex;

  & > *:not(:last-child) {
    margin-right: 15px;
  }
`;

export class InitiativesPage extends React.PureComponent<
  InjectedIntlProps & WithRouterProps
> {
  private tabs = [
    {
      label: this.props.intl.formatMessage(messages.settingsTab),
      url: '/admin/initiatives',
    },
    {
      label: this.props.intl.formatMessage(messages.manageTab),
      url: '/admin/initiatives/manage',
    },
    {
      label: this.props.intl.formatMessage(messages.permissionTab),
      url: '/admin/initiatives/permissions',
      feature: 'granular_permissions',
    },
  ];

  private resource = {
    title: this.props.intl.formatMessage(messages.titleInitiatives),
  };

  onNewProposal = (pathname: string) => (_event) => {
    trackEventByName(tracks.clickNewProposal.name, {
      extra: { pathnameFrom: pathname },
    });
  };

  render() {
    const {
      children,
      intl: { formatMessage },
      location,
    } = this.props;

    const { pathname } = location;
    return (
      <>
        <TopContainer>
          <ActionsContainer>
            <Button
              id="e2e-new-proposal"
              buttonStyle="cl-blue-outlined"
              icon="idea"
              linkTo={`/initiatives/new`}
              text={formatMessage(messages.addNewProposal)}
              onClick={this.onNewProposal(pathname)}
            />
          </ActionsContainer>
        </TopContainer>
        <TabbedResource resource={this.resource} tabs={this.tabs}>
          <HelmetIntl
            title={messages.metaTitle}
            description={messages.metaDescription}
          />
          {children}
        </TabbedResource>
      </>
    );
  }
}

export default withRouter(injectIntl(InitiativesPage));
