import React, { memo, useState } from 'react';
import { WrappedComponentProps } from 'react-intl';
import { Outlet as RouterOutlet } from 'react-router-dom';
// styles
import { InsertConfigurationOptions, ITab } from 'typings';
// tracks
import { trackEventByName } from 'utils/analytics';
import { injectIntl } from 'utils/cl-intl';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { insertConfiguration } from 'utils/moduleUtils';
// components
import HelmetIntl from 'components/HelmetIntl';
import Outlet from 'components/Outlet';
import Button from 'components/UI/Button';
import TabbedResource from 'components/admin/TabbedResource';
// i18n
import messages from './messages';
import tracks from './tracks';

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
        <TabbedResource
          resource={{
            title: formatMessage(messages.titleInitiatives),
            rightSideCTA: (
              <Button
                id="e2e-new-proposal"
                buttonStyle="cl-blue"
                icon="initiatives"
                linkTo={`/initiatives/new`}
                text={formatMessage(messages.addNewProposal)}
                onClick={onNewProposal(pathname)}
              />
            ),
          }}
          tabs={tabs}
        >
          <HelmetIntl
            title={messages.metaTitle}
            description={messages.metaDescription}
          />
          <div id="e2e-initiatives-admin-container">
            <RouterOutlet />
          </div>
        </TabbedResource>
      </>
    );
  }
);

export default withRouter(injectIntl(InitiativesPage));
