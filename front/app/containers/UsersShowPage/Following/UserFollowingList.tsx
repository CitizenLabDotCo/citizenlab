import React from 'react';
import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import useFollowers from 'api/follow_unfollow/useFollowers';
import IdeaCard from 'components/IdeaCard';
import { FollowableObject, IFollowerData } from 'api/follow_unfollow/types';
import InitiativeCard from 'components/InitiativeCard';
import ProjectCard from 'components/ProjectCard';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import ProjectFolderCard from 'components/ProjectAndFolderCards/components/ProjectFolderCard';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useAuthUser from 'api/me/useAuthUser';

interface Props {
  value: FollowableObject;
  userId: string;
}

const UserFollowingList = ({ userId, value }: Props) => {
  const { data: followers, isLoading } = useFollowers({
    followableObject: value,
  });
  const isFollowingEnabled = useFeatureFlag({
    name: 'follow',
  });
  const { data: authUser } = useAuthUser();
  const showFollowing = isFollowingEnabled && authUser?.data?.id === userId;

  if (!showFollowing) return null;

  // We categorise them because we want to display them in different ways so we need to know what type they are before
  const categorizedFollowers: Record<
    'idea' | 'initiative' | 'project' | 'folder',
    IFollowerData[]
  > = {
    idea: [],
    initiative: [],
    project: [],
    folder: [],
  };

  followers?.data.forEach((follower) => {
    const type = follower.relationships.followable.data.type;
    if (categorizedFollowers.hasOwnProperty(type)) {
      categorizedFollowers[type].push(follower);
    }
  });

  return (
    <Box display="flex" w="100%" flexDirection="column">
      {!isLoading && followers?.data.length === 0 ? (
        <Box background={colors.white} p="36px">
          <Text variant="bodyL">
            <FormattedMessage {...messages.emptyInfoText} />
          </Text>
        </Box>
      ) : (
        <Box display="flex" flexWrap="wrap" gap="20px" w="100%">
          {categorizedFollowers.idea.map((follower) => (
            <Box key={follower.id} display="flex" flex="1 0 calc(50% - 20px)">
              <Box width="100%">
                <IdeaCard
                  ideaId={follower.relationships.followable.data.id}
                  showFollowButton
                />
              </Box>
            </Box>
          ))}

          {categorizedFollowers.initiative.map((follower) => (
            <Box
              key={follower.id}
              display="flex"
              flex="1 0 calc(100% * (1 / 3) - 26px)"
            >
              <InitiativeCard
                initiativeId={follower.relationships.followable.data.id}
                showFollowButton
              />
            </Box>
          ))}

          {categorizedFollowers.project.map((follower) => (
            <ProjectCard
              key={follower.id}
              projectId={follower.relationships.followable.data.id}
              size="small"
              showFollowButton
            />
          ))}

          {categorizedFollowers.folder.map((follower) => (
            <ProjectFolderCard
              key={follower.id}
              folderId={follower.relationships.followable.data.id}
              size="small"
              layout="threecolumns"
              showFollowButton
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default UserFollowingList;
