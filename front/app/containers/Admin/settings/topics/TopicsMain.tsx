import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { Tab } from 'components/admin/NavigationTabs';
import NewLabel from 'components/UI/NewLabel';

import { useIntl } from 'utils/cl-intl';
import { useLocation, Outlet } from 'utils/router';

import messages from './messages';

const TopicsMain = () => {
  const { formatMessage } = useIntl();
  const location = useLocation();
  const pathname = location.pathname;
  const showTabs =
    pathname.endsWith('/platform') ||
    pathname.endsWith('/input') ||
    pathname.endsWith('/topics');
  const selectedTopicType: 'platform' | 'input' = pathname.includes('/input')
    ? 'input'
    : 'platform';

  return (
    <>
      {showTabs && (
        <Box display="flex" mb="30px">
          <Tab
            label={formatMessage(messages.tabPlatformTags)}
            url={'/admin/settings/topics/platform'}
            active={selectedTopicType === 'platform'}
          />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap="8px">
                {formatMessage(messages.tabDefaultInputTags)}
                <NewLabel expiryDate={new Date('2026-08-10')} />
              </Box>
            }
            url={'/admin/settings/topics/input'}
            active={selectedTopicType === 'input'}
          />
        </Box>
      )}

      <Outlet />
    </>
  );
};

export default TopicsMain;
