import React, { useState, MouseEvent } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import styled, { css } from 'styled-components';
import { ITab } from 'typings';

import useIdeaById from 'api/ideas/useIdeaById';

import useFeatureFlag from 'hooks/useFeatureFlag';

import InternalComments from 'components/admin/InternalComments';
import { Tab } from 'components/admin/NavigationTabs';
import { tabBorderSize } from 'components/admin/NavigationTabs/tabsStyleConstants';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import PublicComments from './PublicComments';

const NavigationTabs = styled.nav`
  ${({ theme }) => css`
    width: 100%;
    border-radius: ${theme.borderRadius} ${theme.borderRadius} 0 0;
    display: flex;
    border-bottom: ${tabBorderSize}px solid ${colors.grey400};
  `}
`;

export interface Props {
  postId: string;
  className?: string;
  allowAnonymousParticipation?: boolean;
  showInternalComments?: boolean;
  onUnauthenticatedCommentClick?: () => void;
}

type CommentType = 'internal' | 'public';
type NavTab = ITab & { name: CommentType };

const CommentsSection = ({
  postId,
  className,
  allowAnonymousParticipation,
  showInternalComments = false,
  onUnauthenticatedCommentClick,
}: Props) => {
  const { formatMessage } = useIntl();
  const isInternalCommentingEnabled = useFeatureFlag({
    name: 'internal_commenting',
  });
  const isInternalCommentingAllowed = useFeatureFlag({
    name: 'internal_commenting',
    onlyCheckAllowed: true,
  });
  const isInternalCommentingAllowedAndDisabled =
    isInternalCommentingAllowed && !isInternalCommentingEnabled;

  const [selectedTab, setSelectedTab] = useState<CommentType>('internal');
  const { data: idea } = useIdeaById(postId);

  if (!idea) return null;
  const publicCommentCount = idea.data.attributes.comments_count;
  const internalCommentCount = idea.data.attributes.internal_comments_count;
  const commenting_idea =
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    idea?.data.attributes.action_descriptors.commenting_idea;
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const commentingEnabled = commenting_idea?.enabled;

  const tabs: NavTab[] = [
    {
      label: `${formatMessage(
        messages.internalConversation
      )} (${internalCommentCount})`,
      name: 'internal',
      url: '',
    },
    {
      label: `${formatMessage(
        messages.publicDiscussion
      )} (${publicCommentCount})`,
      name: 'public',
      url: '',
    },
  ];

  if (showInternalComments && !isInternalCommentingAllowedAndDisabled) {
    return (
      <Box mt="70px">
        <NavigationTabs>
          {tabs.map(({ url, label, name }) => (
            <Tab
              label={label}
              url={url}
              key={name}
              data-cy={`e2e-comments-tab-${name}`}
              active={selectedTab === name}
              handleClick={(event: MouseEvent<HTMLAnchorElement>) => {
                event.preventDefault();
                setSelectedTab(name);
              }}
            />
          ))}
        </NavigationTabs>
        <Box>
          {selectedTab === 'public' && (
            <Box mt="16px">
              {commentingEnabled === true && (
                <Warning>
                  {formatMessage(messages.visibleToUsersWarning)}
                </Warning>
              )}
              <PublicComments
                postId={postId}
                allowAnonymousParticipation={allowAnonymousParticipation}
                className={className}
                onUnauthenticatedCommentClick={onUnauthenticatedCommentClick}
              />
            </Box>
          )}
          {selectedTab === 'internal' && (
            <>
              {!isInternalCommentingAllowed && (
                <Box mt="16px">
                  <Warning>
                    {formatMessage(messages.internalCommentingNudgeMessage)}
                  </Warning>
                </Box>
              )}
              {isInternalCommentingEnabled && (
                <InternalComments postId={postId} className={className} />
              )}
            </>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <PublicComments
      postId={postId}
      allowAnonymousParticipation={allowAnonymousParticipation}
      className={className}
      onUnauthenticatedCommentClick={onUnauthenticatedCommentClick}
    />
  );
};

export default CommentsSection;
