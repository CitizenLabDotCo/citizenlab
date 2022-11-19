import React, { memo, useState } from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { Outlet as RouterOutlet } from 'react-router-dom';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';
import Button from 'components/UI/Button';

// i18n
import messages from './messages';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// styles
import styled from 'styled-components';
import { InsertConfigurationOptions, ITab } from 'typings';
import Outlet from 'components/Outlet';
import { insertConfiguration } from 'utils/moduleUtils';

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
const InitiativesPage = memo<WrappedComponentProps & WithRouterProps>(
  ({ intl: { formatMessage }, location }) => {
    const [tabs, setTabs] = useState<ITab[]>([
      {
        label: formatMessage(messages.settingsTab),
        name: 'settings',
        url: '/admin/initiatives/settings',
      },
      {
        label: formatMessage(messages.manageTab),
        name: 'manage',
        url: '/admin/initiatives/manage',
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

    const handleData = (data: InsertConfigurationOptions<ITab>) =>
      setTabs(insertConfiguration<ITab>(data));

    const { pathname } = location;
    return (
      <>
        <Outlet
          id="app.containers.Admin.initiatives.tabs"
          onData={handleData}
          formatMessage={formatMessage}
        />
        <TopContainer>
          <ActionsContainer>
            <Button
              id="e2e-new-proposal"
              buttonStyle="cl-blue"
              icon="initiatives"
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
          <div id="e2e-initiatives-admin-container">
            {' '}
            <RouterOutlet />
          </div>
        </TabbedResource>
      </>
    );
  }
);

export default withRouter(injectIntl(InitiativesPage));
