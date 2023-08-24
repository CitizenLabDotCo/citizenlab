import React from 'react';
import {
  Box,
  Text,
  colors,
  useBreakpoint,
  Spinner,
} from '@citizenlab/cl2-component-library';
import useFollowers from 'api/follow_unfollow/useFollowers';
import IdeaCard from 'components/IdeaCard';
import { FollowableObject } from 'api/follow_unfollow/types';
import InitiativeCard from 'components/InitiativeCard';
import ProjectCard from 'components/ProjectCard';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import ProjectFolderCard from 'components/ProjectAndFolderCards/components/ProjectFolderCard';
import Button from 'components/UI/Button';
import { useTheme } from 'styled-components';

interface Props {
  value: FollowableObject;
}

const UserFollowingList = ({ value }: Props) => {
  const {
    data: followers,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
  } = useFollowers({
    followableObject: value,
  });
  const isSmallerThanPhone = useBreakpoint('phone');

  const theme = useTheme();

  const flatFollowers = followers?.pages.flatMap((page) => page.data) || [];

  return (
    <Box display="flex" w="100%" flexDirection="column">
      {isLoading && <Spinner />}
      {!isLoading && flatFollowers.length === 0 ? (
        <Box background={colors.white} p="36px">
          <Text variant="bodyL">
            <FormattedMessage {...messages.emptyInfoText} />
          </Text>
        </Box>
      ) : (
        <Box display="flex" flexWrap="wrap" gap="20px" w="100%">
          {flatFollowers.map((follower) => {
            if (follower.relationships.followable.data.type === 'idea') {
              return (
                <Box
                  key={follower.id}
                  display="flex"
                  flex="1 0 calc(50% - 20px)"
                >
                  <Box width="100%">
                    <IdeaCard
                      ideaId={follower.relationships.followable.data.id}
                      showFollowButton
                    />
                  </Box>
                </Box>
              );
            } else if (
              follower.relationships.followable.data.type === 'initiative'
            ) {
              return (
                <Box
                  key={follower.id}
                  display="flex"
                  flexGrow={0}
                  w={
                    isSmallerThanPhone ? '100%' : 'calc(100% * (1 / 3) - 26px)'
                  }
                >
                  <InitiativeCard
                    initiativeId={follower.relationships.followable.data.id}
                    showFollowButton
                  />
                </Box>
              );
            } else if (
              follower.relationships.followable.data.type === 'project'
            ) {
              return (
                <ProjectCard
                  key={follower.id}
                  projectId={follower.relationships.followable.data.id}
                  size="small"
                  showFollowButton
                />
              );
            } else if (
              follower.relationships.followable.data.type === 'folder'
            ) {
              return (
                <ProjectFolderCard
                  key={follower.id}
                  folderId={follower.relationships.followable.data.id}
                  size="small"
                  layout="threecolumns"
                  showFollowButton
                />
              );
            }
            return null;
          })}
        </Box>
      )}
      {hasNextPage && (
        <Button
          onClick={() => fetchNextPage()}
          buttonStyle="secondary"
          text={<FormattedMessage {...messages.loadMore} />}
          processing={isFetchingNextPage}
          icon="refresh"
          iconPos="left"
          textColor={theme.colors.tenantText}
          fontWeight="500"
          width="auto"
        />
      )}
    </Box>
  );
};

export default UserFollowingList;
