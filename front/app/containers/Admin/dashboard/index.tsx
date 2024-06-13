import React, { memo } from 'react';

import { Outlet as RouterOutlet } from 'react-router-dom';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import HelmetIntl from 'components/HelmetIntl';

import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import DashboardTabs from './components/DashboardTabs';
import messages from './messages';
import { getAdminTabs } from './tabs';

export const DashboardsPage = memo(() => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();

  const representativenessEnabled = useFeatureFlag({
    name: 'representativeness',
  });
  const moderationEnabled = useFeatureFlag({ name: 'moderation' });
  const managementFeedEnabled = useFeatureFlag({ name: 'management_feed' });

  if (!authUser || !isAdmin(authUser)) {
    return null;
  }

  const tabs = getAdminTabs(
    {
      representativenessEnabled,
      moderationEnabled,
      managementFeedEnabled,
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
