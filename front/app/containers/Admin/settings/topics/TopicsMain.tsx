import React, { useEffect, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useLocation, Outlet } from 'react-router-dom';

import { Tab } from 'components/admin/NavigationTabs';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const AllTopicsComponent = React.lazy(() => import('./global_topics'));
const DefaultInputTopicsComponent = React.lazy(
  () => import('./default_input_topics')
);

type TopicType = 'platform' | 'input';

const TopicsMain = () => {
  const { formatMessage } = useIntl();
  const location = useLocation();
  const pathname = location.pathname;
  const isMainPage =
    pathname.endsWith('/platform') ||
    pathname.endsWith('/input') ||
    pathname.endsWith('/topics');

  const [selectedTopicType, setSelectedTopicType] =
    useState<TopicType>('platform');

  useEffect(() => {
    const isInput = pathname.includes('/input');

    setSelectedTopicType(isInput ? 'input' : 'platform');
  }, [pathname]);

  return (
    <>
      {isMainPage && (
        <Box display="flex" mb="30px">
          <Tab
            label={formatMessage(messages.tabPlatformTags)}
            url={'/admin/settings/topics/platform'}
            active={selectedTopicType === 'platform'}
          />
          <Tab
            label={formatMessage(messages.tabDefaultInputTags)}
            url={'/admin/settings/topics/input'}
            active={selectedTopicType === 'input'}
          />
        </Box>
      )}

      {isMainPage ? (
        selectedTopicType === 'platform' ? (
          <AllTopicsComponent />
        ) : (
          <DefaultInputTopicsComponent />
        )
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default TopicsMain;
