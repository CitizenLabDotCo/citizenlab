import React, { memo, useState } from 'react';
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
const InitiativesPage = memo<InjectedIntlProps & WithRouterProps>(
  ({ children, intl: { formatMessage }, location }) => {
    const [tabs] = useState([
      {
        label: formatMessage(messages.settingsTab),
        url: '/admin/initiatives',
      },
      {
        label: formatMessage(messages.manageTab),
        url: '/admin/initiatives/manage',
      },
      {
        label: formatMessage(messages.permissionTab),
        url: '/admin/initiatives/permissions',
        feature: 'granular_permissions',
      },
    ]);

    const resource = {
      title: formatMessage(messages.titleInitiatives),
    };

    const onNewProposal = (pathname: string) => (_event) => {
      trackEventByName(tracks.clickNewProposal.name, {
        extra: { pathnameFrom: pathname },
      });
    };

    const { pathname } = location;
    return (
      <>
        <TopContainer>
          <ActionsContainer>
            <Button
              id="e2e-new-proposal"
              buttonStyle="cl-blue"
              icon="initiativesAdminMenuIcon"
              linkTo={`/initiatives/new`}
              text={formatMessage(messages.addNewProposal)}
              onClick={onNewProposal(pathname)}
            />
          </ActionsContainer>
        </TopContainer>
        <TabbedResource resource={resource} tabs={tabs}>
          <HelmetIntl
            title={messages.metaTitle}
            description={messages.metaDescription}
          />
          {children}
        </TabbedResource>
      </>
    );
  }
);

export default withRouter(injectIntl(InitiativesPage));
