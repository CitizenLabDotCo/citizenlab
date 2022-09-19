import React, { memo, useState, useEffect } from 'react';
import { insertConfiguration } from 'utils/moduleUtils';
import { Outlet as RouterOutlet } from 'react-router-dom';

// components
import HelmetIntl from 'components/HelmetIntl';
import DashboardTabs from './components/DashboardTabs';
import Outlet from 'components/Outlet';

// hooks
import useAuthUser from 'hooks/useAuthUser';

// permissions
import { isAdmin, isProjectModerator } from 'services/permissions/roles';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { InsertConfigurationOptions, ITab } from 'typings';

export const DashboardsPage = memo(
  ({ intl: { formatMessage } }: InjectedIntlProps) => {
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

      return () => setTabs([]);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser]);

    const resource = {
      title: formatMessage(messages.titleDashboard),
      subtitle: formatMessage(messages.subtitleDashboard),
    };

    const handleData = (data: InsertConfigurationOptions<ITab>) => {
      setTabs((tabs) => insertConfiguration(data)(tabs));
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
