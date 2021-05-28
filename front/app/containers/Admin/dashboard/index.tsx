import React, { memo, useState, useEffect } from 'react';
import { adopt } from 'react-adopt';
import { insertConfiguration } from 'utils/moduleUtils';

// components
import HelmetIntl from 'components/HelmetIntl';
import DashboardTabs from './components/DashboardTabs';
import Outlet from 'components/Outlet';

// resource
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// permissions
import { isAdmin, isProjectModerator } from 'services/permissions/roles';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// typings
import { InsertConfigurationOptions, ITab } from 'typings';
interface Props {
  authUser: GetAuthUserChildProps;
  children: JSX.Element;
}

export const DashboardsPage = memo(
  ({
    authUser,
    children,
    intl: { formatMessage },
  }: Props & InjectedIntlProps) => {
    const [tabs, setTabs] = useState<ITab[]>([
      {
        label: formatMessage(messages.tabSummary),
        url: '/admin/dashboard',
        name: 'dashboard',
      },
      {
        label: formatMessage(messages.tabUsers),
        url: '/admin/dashboard/users',
        name: 'users',
      },
      {
        label: formatMessage(messages.tabReports),
        url: '/admin/dashboard/reports',
        feature: 'project_reports',
        name: 'project_reports',
      },
    ]);

    const moderatorTabs: ITab[] = [
      {
        label: formatMessage(messages.tabSummary),
        url: '/admin/dashboard',
        name: 'dashboard',
      },
      {
        label: formatMessage(messages.tabReports),
        url: '/admin/dashboard/reports',
        feature: 'project_reports',
        name: 'project_reports',
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
        <DashboardTabs resource={resource} tabs={tabs}>
          <HelmetIntl
            title={messages.helmetTitle}
            description={messages.helmetDescription}
          />
          {children}
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
