import React, { useState } from 'react';
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { FollowableObject } from 'api/follow_unfollow/types';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import Topics from 'components/Topics';
import Areas from 'components/Areas';
import UserFollowingList from './UserFollowingList';
import useAuthUser from 'api/me/useAuthUser';
import FilterTabs, { TabData } from 'components/UI/FilterTabs';

type FollowableValue = FollowableObject | 'Topics' | 'Areas';

interface Props {
  userId: string;
}

const Following = ({ userId }: Props) => {
  const [currentTab, setSelectedTab] = useState<FollowableValue>('Project');
  const handleOnChangeTab = (selectedTab: FollowableValue) => {
    setSelectedTab(selectedTab);
  };
  const { data: authUser } = useAuthUser();
  const isSmallerThanPhone = useBreakpoint('phone');
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

  const getScreenReaderTextForTab = (tab: string) => (
    <FormattedMessage {...tabData[tab].label} />
  );

  return (
    <Box display="flex" w="100%" flexDirection="column">
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
      {isSmallerThanPhone && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          mb="16px"
        >
          <FormattedMessage
            {...messages.followingWithCount}
            values={{
              followingCount: authUser?.data.attributes.followings_count,
            }}
          />
        </Box>
      )}
      {currentTab === 'Topics' && <Topics />}
      {currentTab === 'Areas' && <Areas />}
      {currentTab !== 'Topics' && currentTab !== 'Areas' && (
        <UserFollowingList value={currentTab} userId={userId} />
      )}
    </Box>
  );
};

export default Following;
