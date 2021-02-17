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
import { ITab } from 'typings';
import Outlet from 'components/Outlet';

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
    const [tabs, setTabs] = useState<ITab[]>([
      {
        label: formatMessage(messages.settingsTab),
        name: 'initiatives',
        url: '/admin/initiatives',
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

    const insertTab = ({
      tabConfiguration,
      insertAfterTabName,
    }: {
      tabConfiguration: ITab;
      insertAfterTabName?: string;
    }) => {
      setTabs((tabs) => {
        const insertIndex =
          tabs.findIndex((tab) => tab.name === insertAfterTabName) + 1;
        if (insertIndex > 0) {
          return [
            ...tabs.slice(0, insertIndex),
            tabConfiguration,
            ...tabs.slice(insertIndex),
          ];
        }
        return [...tabs, tabConfiguration];
      });
    };

    const { pathname } = location;
    return (
      <>
        <Outlet
          id="app.containers.Admin.initiatives.tabs"
          onData={insertTab}
          formatMessage={formatMessage}
        />
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
