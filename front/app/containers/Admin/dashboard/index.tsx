import React, { memo, useState } from 'react';
import { insertConfiguration } from 'utils/moduleUtils';
import { Outlet as RouterOutlet } from 'react-router-dom';

// components
import HelmetIntl from 'components/HelmetIntl';
import DashboardTabs from './components/DashboardTabs';
import Outlet from 'components/Outlet';

// hooks
import useAuthUser from 'api/me/useAuthUser';

// permissions
import { isAdmin, isProjectModerator } from 'utils/permissions/roles';

// i18n
import messages from './messages';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// typings
import { InsertConfigurationOptions, ITab } from 'typings';

export const DashboardsPage = memo(
  ({ intl: { formatMessage } }: WrappedComponentProps) => {
    const { data: authUser } = useAuthUser();
    const [adminTabs, setAdminTabs] = useState<ITab[]>([
      {
        label: formatMessage(messages.tabOverview),
        url: '/admin/dashboard/overview',
        name: 'overview',
      },
      {
        label: formatMessage(messages.tabUsers),
        url: '/admin/dashboard/users',
        name: 'users',
      },
    ]);

    if (!authUser || (!isAdmin(authUser) && !isProjectModerator(authUser))) {
      return null;
    }

    const moderatorTabs: ITab[] = [
      {
        label: formatMessage(messages.tabOverview),
        url: '/admin/dashboard/overview',
        name: 'overview',
      },
    ];

    const tabs = isAdmin(authUser) ? adminTabs : moderatorTabs;

    const resource = {
      title: formatMessage(messages.titleDashboard),
      subtitle: formatMessage(messages.subtitleDashboard),
    };

    const handleData = (data: InsertConfigurationOptions<ITab>) => {
      if (!isAdmin(authUser)) return;
      setAdminTabs((tabs) => insertConfiguration(data)(tabs));
    };

    return (
      <>
        <Outlet
          id="app.containers.Admin.dashboards.tabs"
          onData={handleData}
          formatMessage={formatMessage}
        />
        {/* Filter out project tab when insights module is active */}
        <DashboardTabs resource={resource} tabs={tabs}>
          <HelmetIntl
            title={messages.helmetTitle}
            description={messages.helmetDescription}
          />
          <div id="e2e-dashboard-container">
            <RouterOutlet />
          </div>
        </DashboardTabs>
      </>
    );
  }
);

export default injectIntl(DashboardsPage);
