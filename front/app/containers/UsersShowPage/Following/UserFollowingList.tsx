import React, { useState, useEffect } from 'react';

import {
  Box,
  Text,
  colors,
  useBreakpoint,
  Spinner,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { FollowableObject } from 'api/follow_unfollow/types';
import useFollowers from 'api/follow_unfollow/useFollowers';

import IdeaCard from 'components/IdeaCard';
import InitiativeCard from 'components/InitiativeCard';
import ProjectFolderCard from 'components/ProjectAndFolderCards/components/ProjectFolderCard';
import ProjectCard from 'components/ProjectCard';
import Button from 'components/UI/Button';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

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
  const { formatMessage } = useIntl();

  const theme = useTheme();

  const flatFollowers = followers?.pages.flatMap((page) => page.data) || [];

  const [emptyText, setEmptyText] = useState('');

  useEffect(() => {
    if (!isLoading && flatFollowers.length === 0) {
      setEmptyText(formatMessage(messages.emptyInfoText));
    } else {
      setEmptyText('');
    }
  }, [isLoading, flatFollowers.length, formatMessage]);

  return (
    <Box display="flex" w="100%" flexDirection="column">
      <ScreenReaderOnly aria-live="polite" role="status">
        {emptyText}
      </ScreenReaderOnly>
      {isLoading && <Spinner />}
      {!isLoading && flatFollowers.length === 0 ? (
        <Box background={colors.white} p="36px">
          <Text variant="bodyL">{emptyText}</Text>
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
