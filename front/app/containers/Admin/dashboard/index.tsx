import React, { memo, useEffect, useState } from 'react';
import { adopt } from 'react-adopt';
import { Outlet as RouterOutlet } from 'react-router-dom';
import { insertConfiguration } from 'utils/moduleUtils';

// components
import HelmetIntl from 'components/HelmetIntl';
import Outlet from 'components/Outlet';
import DashboardTabs from './components/DashboardTabs';

// resource
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// permissions
import { isAdmin, isProjectModerator } from 'services/permissions/roles';

// i18n
import { injectIntl, WrappedComponentProps } from 'react-intl';
import messages from './messages';

// typings
import { InsertConfigurationOptions, ITab } from 'typings';

interface Props {
  authUser: GetAuthUserChildProps;
  children: JSX.Element;
}

export const DashboardsPage = memo(
  ({ authUser, intl: { formatMessage } }: Props & WrappedComponentProps) => {
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
        authUser &&
        !isAdmin({ data: authUser }) &&
        isProjectModerator({ data: authUser })
      ) {
        setTabs(moderatorTabs);
      }

      return () => setTabs([]);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isProjectModerator, authUser]);

    const resource = {
      title: formatMessage(messages.titleDashboard),
      subtitle: formatMessage(messages.subtitleDashboard),
    };

    const handleData = (data: InsertConfigurationOptions<ITab>) =>
      setTabs((tabs) => insertConfiguration(data)(tabs));

    if (
      !authUser ||
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

const DashboardsPageWithHoC = injectIntl(DashboardsPage);

const Data = adopt({
  authUser: <GetAuthUser />,
});

export default (props) => (
  <Data {...props}>
    {(dataProps) => <DashboardsPageWithHoC {...dataProps} {...props} />}
  </Data>
);
