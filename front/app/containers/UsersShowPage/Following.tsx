import React, { useState } from 'react';
import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import useFollowers from 'api/follow_unfollow/useFollowers';
import IdeaCard from 'components/IdeaCard';
import { FollowableObject } from 'api/follow_unfollow/types';
import InitiativeCard from 'components/InitiativeCard';
import ProjectCard from 'components/ProjectCard';
import FilterSelector from 'components/FilterSelector';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import ProjectFolderCard from 'components/ProjectAndFolderCards/components/ProjectFolderCard';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useAuthUser from 'api/me/useAuthUser';

interface IFilterOption {
  text: JSX.Element;
  value: FollowableObject;
}

const options: IFilterOption[] = [
  { text: <FormattedMessage {...messages.projects} />, value: 'Project' },
  { text: <FormattedMessage {...messages.initiatives} />, value: 'Initiative' },
  { text: <FormattedMessage {...messages.ideas} />, value: 'Idea' },
  {
    text: <FormattedMessage {...messages.projectFolders} />,
    value: 'ProjectFolders::Folder',
  },
];

interface Props {
  userId: string;
}

const Following = ({ userId }: Props) => {
  const [selectedValue, setSelectedValue] =
    useState<FollowableObject>('Project');
  const { data: followers, isLoading } = useFollowers({
    followableObject: selectedValue,
  });
  const handleOnChange = (selectedValue: [FollowableObject]) => {
    setSelectedValue(selectedValue[0]);
  };
  const isFollowingEnabled = useFeatureFlag({
    name: 'follow',
  });
  const { data: authUser } = useAuthUser();
  const showFollowing = isFollowingEnabled && authUser?.data?.id === userId;

  if (!showFollowing) return null;

  return (
    <Box display="flex" w="100%" flexDirection="column">
      <Box mb="16px" w="100%" display="flex" justifyContent="flex-end">
        <FilterSelector
          title={<FormattedMessage {...messages.projects} />}
          name="sort"
          selected={[selectedValue]}
          values={options}
          onChange={handleOnChange}
          multipleSelectionAllowed={false}
          width="180px"
        />
      </Box>
      {!isLoading && followers?.data.length === 0 ? (
        <Box background={colors.white} p="36px">
          <Text variant="bodyL">
            <FormattedMessage {...messages.emptyInfoText} />
          </Text>
        </Box>
      ) : (
        <Box display="flex" flexWrap="wrap" gap="20px">
          {followers?.data.map((follower) => (
            <>
              {follower.relationships.followable.data.type === 'idea' && (
                <Box width="calc(50% - 20px)">
                  <IdeaCard
                    ideaId={follower.relationships.followable.data.id}
                    showFollowButton
                  />
                </Box>
              )}
              {follower.relationships.followable.data.type === 'initiative' && (
                <Box width="calc(100% * (1 / 3) - 26px)">
                  <InitiativeCard
                    initiativeId={follower.relationships.followable.data.id}
                    showFollowButton
                  />
                </Box>
              )}
              {follower.relationships.followable.data.type === 'project' && (
                <ProjectCard
                  projectId={follower.relationships.followable.data.id}
                  size="small"
                  showFollowButton
                />
              )}
              {follower.relationships.followable.data.type === 'folder' && (
                <ProjectFolderCard
                  folderId={follower.relationships.followable.data.id}
                  size="small"
                  layout="threecolumns"
                  showFollowButton
                />
              )}
            </>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Following;
