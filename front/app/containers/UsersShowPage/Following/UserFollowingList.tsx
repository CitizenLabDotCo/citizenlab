import React from 'react';
import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import useFollowers from 'api/follow_unfollow/useFollowers';
import IdeaCard from 'components/IdeaCard';
import { FollowableObject } from 'api/follow_unfollow/types';
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

  const followedIdeas =
    followers?.data.filter(
      (follower) => follower.relationships.followable.data.type === 'idea'
    ) || [];
  const followedInitiatives =
    followers?.data.filter(
      (follower) => follower.relationships.followable.data.type === 'initiative'
    ) || [];
  const followedProjects =
    followers?.data.filter(
      (follower) => follower.relationships.followable.data.type === 'project'
    ) || [];
  const followedFolders =
    followers?.data.filter(
      (follower) => follower.relationships.followable.data.type === 'folder'
    ) || [];

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
          {followedIdeas.map((follower) => (
            <Box key={follower.id} display="flex" flex="1 0 calc(50% - 20px)">
              <Box width="100%">
                <IdeaCard
                  ideaId={follower.relationships.followable.data.id}
                  showFollowButton
                />
              </Box>
            </Box>
          ))}

          {followedInitiatives.map((follower) => (
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

          {followedProjects.map((follower) => (
            <ProjectCard
              key={follower.id}
              projectId={follower.relationships.followable.data.id}
              size="small"
              showFollowButton
            />
          ))}

          {followedFolders.map((follower) => (
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
