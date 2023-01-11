import React, { memo, useState, useEffect } from 'react';
import { Outlet as RouterOutlet } from 'react-router-dom';

// components
import HelmetIntl from 'components/HelmetIntl';
import DashboardTabs from './components/DashboardTabs';

// hooks
import useAuthUser from 'hooks/useAuthUser';

// permissions
import { isAdmin, isProjectModerator } from 'services/permissions/roles';

// i18n
import messages from './messages';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { ITab } from 'typings';

export const DashboardsPage = memo(
  ({ intl: { formatMessage } }: WrappedComponentProps) => {
    const authUser = useAuthUser();
    const [tabs, setTabs] = useState<ITab[]>([
      {
        label: formatMessage(messages.tabOverview),
        url: '/admin/dashboard',
        name: 'overview',
      },
      {
        label: formatMessage(messages.tabUsers),
        url: '/admin/dashboard/users',
        name: 'users',
      },
    ]);

    const moderatorTabs: ITab[] = [
      {
        label: formatMessage(messages.tabOverview),
        url: '/admin/dashboard',
        name: 'overview',
      },
    ];

    useEffect(() => {
      if (
        !isNilOrError(authUser) &&
        !isAdmin({ data: authUser }) &&
        isProjectModerator({ data: authUser })
      ) {
        setTabs(moderatorTabs);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser]);

    const resource = {
      title: formatMessage(messages.titleDashboard),
      subtitle: formatMessage(messages.subtitleDashboard),
    };

    if (
      isNilOrError(authUser) ||
      (authUser &&
        !isAdmin({ data: authUser }) &&
        !isProjectModerator({ data: authUser }))
    ) {
      return null;
    }

    return (
      <>
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
