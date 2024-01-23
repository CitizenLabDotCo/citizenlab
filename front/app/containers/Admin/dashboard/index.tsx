import React, { memo } from 'react';
import { Outlet as RouterOutlet } from 'react-router-dom';

// components
import HelmetIntl from 'components/HelmetIntl';
import DashboardTabs from './components/DashboardTabs';

// hooks
import useAuthUser from 'api/me/useAuthUser';
import useFeatureFlag from 'hooks/useFeatureFlag';

// permissions
import { isAdmin } from 'utils/permissions/roles';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { getAdminTabs } from './tabs';

export const DashboardsPage = memo(() => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();

  const visitorsEnabled = useFeatureFlag({ name: 'analytics' });
  const representativenessEnabled = useFeatureFlag({
    name: 'representativeness',
  });
  const moderationEnabled = useFeatureFlag({ name: 'moderation' });

  if (!authUser || !isAdmin(authUser)) {
    return null;
  }

  const tabs = getAdminTabs(
    {
      visitorsEnabled,
      representativenessEnabled,
      moderationEnabled,
    },
    formatMessage
  );

  return (
    <>
      <DashboardTabs tabs={tabs}>
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
});

export default DashboardsPage;
