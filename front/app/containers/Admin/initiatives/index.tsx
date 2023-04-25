import React, { memo, useState } from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { Outlet as RouterOutlet } from 'react-router-dom';

// components
import HelmetIntl from 'components/HelmetIntl';
import NavigationTabs, {
  Tab,
  TabsPageLayout,
} from 'components/admin/NavigationTabs';
import Link from 'utils/cl-router/Link';

// i18n
import messages from './messages';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// styles
import { InsertConfigurationOptions, ITab } from 'typings';
import Outlet from 'components/Outlet';
import { insertConfiguration } from 'utils/moduleUtils';
import styled from 'styled-components';

// utils
import { matchPathToUrl } from 'utils/helperUtils';

const StyledTabsPageLayout = styled(TabsPageLayout)`
  padding-left: 44px;
`;

const InitiativesPage = memo<WrappedComponentProps & WithRouterProps>(
  ({ intl: { formatMessage }, location }) => {
    const [tabs, setTabs] = useState<ITab[]>([
      {
        label: formatMessage(messages.proposals),
        name: 'proposals',
        url: '/admin/initiatives',
      },
      {
        label: formatMessage(messages.settingsTab),
        name: 'settings',
        url: '/admin/initiatives/settings',
      },
    ]);

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
        <NavigationTabs>
          {tabs.map(({ url, label }) => (
            <Tab key={url} active={matchPathToUrl(url).test(pathname)}>
              <Link to={url}>{label}</Link>
            </Tab>
          ))}
        </NavigationTabs>

        <StyledTabsPageLayout>
          <HelmetIntl
            title={messages.metaTitle}
            description={messages.metaDescription}
          />
          <div id="e2e-initiatives-admin-container">
            <RouterOutlet />
          </div>
        </StyledTabsPageLayout>
      </>
    );
  }
);

export default withRouter(injectIntl(InitiativesPage));
