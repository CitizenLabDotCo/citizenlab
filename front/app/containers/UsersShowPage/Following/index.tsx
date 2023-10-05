import React, { useState } from 'react';
import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import { FollowableObject } from 'api/follow_unfollow/types';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import Topics from 'components/Topics';
import Areas from 'components/Areas';
import UserFollowingList from './UserFollowingList';
import useAuthUser from 'api/me/useAuthUser';
import FilterTabs, { TabData } from 'components/UI/FilterTabs';
import tracks from 'components/FollowUnfollow/tracks';
import { trackEventByName } from 'utils/analytics';
import { useParams } from 'react-router-dom';
import useUserBySlug from 'api/users/useUserBySlug';
import useFeatureFlag from 'hooks/useFeatureFlag';

type FollowableValue = FollowableObject | 'Topics' | 'Areas';

const Following = () => {
  const { userSlug } = useParams() as { userSlug: string };
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
  const tabData: TabData<false> = {
    Project: {
      label: messages.projects,
    },
    Initiative: {
      label: messages.initiatives,
    },
    Idea: {
      label: messages.ideas,
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

  if (!user || (isFollowingEnabled && authUser?.data?.id !== user.data.id)) {
    return null;
  }

  const getScreenReaderTextForTab = (tab: string) => (
    <FormattedMessage {...tabData[tab].label} />
  );

  trackEventByName(tracks.browseFollowsInActivityPage);

  return (
    <Box display="flex" w="100%" flexDirection="column">
      {isSmallerThanPhone && (
        <Title mt="0px" variant="h3" as="h1">
          <FormattedMessage
            {...messages.followingWithCount}
            values={{
              followingCount: authUser?.data.attributes.followings_count,
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
            'Initiative',
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
      {currentTab === 'Topics' && <Topics />}
      {currentTab === 'Areas' && <Areas />}
      {currentTab !== 'Topics' && currentTab !== 'Areas' && (
        <UserFollowingList value={currentTab} />
      )}
    </Box>
  );
};

export default Following;
