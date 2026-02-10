import React, { useEffect, useState } from 'react';

import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';

import { FollowableObject } from 'api/follow_unfollow/types';
import useAuthUser from 'api/me/useAuthUser';
import useUserBySlug from 'api/users/useUserBySlug';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Areas from 'components/Areas';
import tracks from 'components/FollowUnfollow/tracks';
import Topics from 'components/Topics';
import FilterTabs, { TabData } from 'components/UI/FilterTabs';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from '../messages';

import UserFollowingList from './UserFollowingList';

type FollowableValue = FollowableObject | 'Topics' | 'Areas';

const Following = () => {
  const { userSlug } = useParams({ from: '/$locale/profile/$userSlug' });
  const { data: user } = useUserBySlug(userSlug);
  const [currentTab, setSelectedTab] = useState<FollowableValue>('Project');
  const handleOnChangeTab = (selectedTab: FollowableValue) => {
    setSelectedTab(selectedTab);
  };
  const { data: authUser } = useAuthUser();
  const isSmallerThanPhone = useBreakpoint('phone');
  const isFollowingEnabled = useFeatureFlag({
    name: 'follow',
  });
  const tabData: TabData = {
    Project: {
      label: messages.projects,
    },
    Idea: {
      label: messages.inputs,
    },
    'ProjectFolders::Folder': {
      label: messages.projectFolders,
    },
    Topics: {
      label: messages.topics,
    },
    Areas: {
      label: messages.areas,
    },
  };

  const renderPage =
    isFollowingEnabled && user && authUser?.data.id === user.data.id;

  useEffect(() => {
    if (!renderPage) return;
    trackEventByName(tracks.browseFollowsInActivityPage);
  }, [renderPage]);

  if (!renderPage) {
    return null;
  }

  const getScreenReaderTextForTab = (tab: string) => (
    <FormattedMessage {...tabData[tab].label} />
  );

  return (
    <Box display="flex" w="100%" flexDirection="column" id="tab-following">
      {isSmallerThanPhone && (
        <Title mt="0px" variant="h3" as="h1">
          <FormattedMessage
            {...messages.followingWithCount}
            values={{
              followingCount: authUser.data.attributes.followings_count,
            }}
          />
        </Title>
      )}
      <Box borderBottom="1px solid #d1d1d1" mb="24px">
        <FilterTabs
          currentTab={currentTab}
          availableTabs={[
            'Project',
            'Idea',
            'ProjectFolders::Folder',
            'Topics',
            'Areas',
          ]}
          onChangeTab={handleOnChangeTab}
          tabData={tabData}
          showCount={false}
          getScreenReaderTextForTab={getScreenReaderTextForTab}
        />
      </Box>
      {currentTab === 'Topics' && (
        <div role="tabpanel" aria-labelledby={`tab-${currentTab}`} tabIndex={0}>
          <Topics />
        </div>
      )}
      {currentTab === 'Areas' && (
        <div role="tabpanel" aria-labelledby={`tab-${currentTab}`} tabIndex={0}>
          <Areas />
        </div>
      )}
      {currentTab !== 'Topics' && currentTab !== 'Areas' && (
        <div role="tabpanel" aria-labelledby={`tab-${currentTab}`} tabIndex={0}>
          <UserFollowingList value={currentTab} />
        </div>
      )}
    </Box>
  );
};

export default Following;
