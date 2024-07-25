import React from 'react';

import {
  Box,
  Text,
  colors,
  useBreakpoint,
  Spinner,
} from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import { FollowableObject } from 'api/follow_unfollow/types';
import useFollowers from 'api/follow_unfollow/useFollowers';

import IdeaCard from 'components/IdeaCard';
import InitiativeCard from 'components/InitiativeCard';
import ProjectFolderCard from 'components/ProjectAndFolderCards/components/ProjectFolderCard';
import ProjectCard from 'components/ProjectCard/SmallProjectCard';
import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  value: FollowableObject;
}

const List = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
  padding: 0;
  margin: 0;
  list-style-type: none;

  &::after {
    content: '';
    flex: 1 0 calc(33.333% - 20px);
    @media (max-width: 600px) {
      display: none;
    }
  }
`;

const ListItem = styled.li`
  display: flex;
  flex: 1 0 calc(33.333% - 20px);

  @media (max-width: 600px) {
    flex: 1 0 100%;
  }
`;

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
        <Box background={colors.white} p="36px" aria-live="polite">
          <Text variant="bodyL">
            <FormattedMessage {...messages.emptyInfoText} />
          </Text>
        </Box>
      ) : (
        <List>
          {flatFollowers.map((follower) => {
            if (follower.relationships.followable.data.type === 'idea') {
              return (
                <ListItem key={follower.id}>
                  <Box width="100%">
                    <IdeaCard
                      ideaId={follower.relationships.followable.data.id}
                      showFollowButton
                    />
                  </Box>
                </ListItem>
              );
            } else if (
              follower.relationships.followable.data.type === 'initiative'
            ) {
              return (
                <ListItem
                  key={follower.id}
                  style={{
                    width: isSmallerThanPhone ? '100%' : 'calc(33.333% - 20px)',
                  }}
                >
                  <InitiativeCard
                    initiativeId={follower.relationships.followable.data.id}
                    showFollowButton
                  />
                </ListItem>
              );
            } else if (
              follower.relationships.followable.data.type === 'project'
            ) {
              return (
                <ListItem key={follower.id}>
                  <ProjectCard
                    projectId={follower.relationships.followable.data.id}
                    showFollowButton
                  />
                </ListItem>
              );
            } else if (
              follower.relationships.followable.data.type === 'folder'
            ) {
              return (
                <ListItem key={follower.id}>
                  <ProjectFolderCard
                    folderId={follower.relationships.followable.data.id}
                    size="small"
                    layout="threecolumns"
                    showFollowButton
                  />
                </ListItem>
              );
            }
            return null;
          })}
        </List>
      )}
      {hasNextPage && (
        <Button
          onClick={() => fetchNextPage()}
          buttonStyle="secondary-outlined"
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
