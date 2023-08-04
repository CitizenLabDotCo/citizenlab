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

interface Props {
  value: FollowableObject;
}

const UserFollowingList = ({ value }: Props) => {
  const { data: followers, isLoading } = useFollowers({
    followableObject: value,
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

export default UserFollowingList;
