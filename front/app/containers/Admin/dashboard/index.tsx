import React, { memo, useState } from 'react';
import { Outlet as RouterOutlet } from 'react-router-dom';

// components
import HelmetIntl from 'components/HelmetIntl';
import DashboardTabs from './components/DashboardTabs';

// hooks
import useAuthUser from 'api/me/useAuthUser';

// permissions
import { isAdmin, isProjectModerator } from 'utils/permissions/roles';

// i18n
import messages from './messages';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// typings
import { ITab } from 'typings';

const MODERATOR_TABS = [
  {
    message: messages.tabOverview,
    url: '/admin/dashboard/overview',
    name: 'overview',
  },
];

const ADMIN_TABS = [
  ...MODERATOR_TABS,
  {
    message: messages.tabUsers,
    url: '/admin/dashboard/users',
    name: 'users',
  },
];

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

    return (
      <>
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
