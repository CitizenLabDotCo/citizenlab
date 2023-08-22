import React, { useState } from 'react';
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { FollowableObject } from 'api/follow_unfollow/types';
import FilterSelector from 'components/FilterSelector';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import Topics from './Topics';
import Areas from './Areas';
import UserFollowingList from './UserFollowingList';
import useAuthUser from 'api/me/useAuthUser';
import tracks from 'components/FollowUnfollow/tracks';
import { trackEventByName } from 'utils/analytics';

type FollowableValue = FollowableObject | 'Topics' | 'Areas';

interface IFilterOption {
  text: JSX.Element;
  value: FollowableValue;
}

const options: IFilterOption[] = [
  { text: <FormattedMessage {...messages.projects} />, value: 'Project' },
  { text: <FormattedMessage {...messages.initiatives} />, value: 'Initiative' },
  { text: <FormattedMessage {...messages.ideas} />, value: 'Idea' },
  {
    text: <FormattedMessage {...messages.projectFolders} />,
    value: 'ProjectFolders::Folder',
  },
  { text: <FormattedMessage {...messages.topics} />, value: 'Topics' },
  { text: <FormattedMessage {...messages.areas} />, value: 'Areas' },
];

interface Props {
  userId: string;
}

const Following = ({ userId }: Props) => {
  const [selectedValue, setSelectedValue] =
    useState<FollowableValue>('Project');
  const handleOnChange = (selectedValue: [FollowableValue]) => {
    setSelectedValue(selectedValue[0]);
  };
  const { data: authUser } = useAuthUser();
  const isSmallerThanPhone = useBreakpoint('phone');

  trackEventByName(tracks.browseFollowsInActivityPage);

  return (
    <Box display="flex" w="100%" flexDirection="column">
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
      <Box
        mb="16px"
        w="100%"
        display="flex"
        justifyContent={isSmallerThanPhone ? 'flex-start' : 'flex-end'}
      >
        <FilterSelector
          title={<FormattedMessage {...messages.projects} />}
          name="sort"
          selected={[selectedValue]}
          values={options}
          onChange={handleOnChange}
          multipleSelectionAllowed={false}
          width="180px"
          right="0px"
          id="e2e-user-following-filter-selector"
        />
      </Box>
      {selectedValue === 'Topics' && <Topics />}
      {selectedValue === 'Areas' && <Areas />}
      {selectedValue !== 'Topics' && selectedValue !== 'Areas' && (
        <UserFollowingList value={selectedValue} userId={userId} />
      )}
    </Box>
  );
};

export default Following;
