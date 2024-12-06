import React, { memo } from 'react';

import { Outlet as RouterOutlet } from 'react-router-dom';

import useFeatureFlag from 'hooks/useFeatureFlag';

import HelmetIntl from 'components/HelmetIntl';

import { useIntl } from 'utils/cl-intl';

import DashboardTabs from './components/DashboardTabs';
import messages from './messages';
import { getAdminTabs } from './tabs';

export const DashboardsPage = memo(() => {
  const { formatMessage } = useIntl();
  const moderationEnabled = useFeatureFlag({ name: 'moderation' });
  const managementFeedEnabled = useFeatureFlag({ name: 'management_feed' });
  const managementFeedAllowed = useFeatureFlag({
    name: 'management_feed',
    onlyCheckAllowed: true,
  });
  const managementFeedAllowedAndDisabled =
    managementFeedAllowed && !managementFeedEnabled;

  const tabs = getAdminTabs(
    {
      moderationEnabled,
      managementFeedAllowedAndDisabled,
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
