import React, { useState, MouseEvent } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import styled, { css } from 'styled-components';
import { ITab } from 'typings';

import useIdeaById from 'api/ideas/useIdeaById';
import useInitiativeById from 'api/initiatives/useInitiativeById';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';

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
  postType: 'idea' | 'initiative';
  className?: string;
  allowAnonymousParticipation?: boolean;
  showInternalComments?: boolean;
}

type CommentType = 'internal' | 'public';
type NavTab = ITab & { name: CommentType };

const CommentsSection = ({
  postId,
  postType,
  className,
  allowAnonymousParticipation,
  showInternalComments = false,
}: Props) => {
  const { formatMessage } = useIntl();
  const isInternalCommentingEnabled = useFeatureFlag({
    name: 'internal_commenting',
  });
  const initiativeCommentingPermissions = useInitiativesPermissions(
    'commenting_initiative'
  );
  const [selectedTab, setSelectedTab] = useState<CommentType>('internal');
  const initiativeId = postType === 'initiative' ? postId : undefined;
  const ideaId = postType === 'idea' ? postId : undefined;
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: idea } = useIdeaById(ideaId);
  const post = initiative || idea;

  if (!post) return null;
  const publicCommentCount = post.data.attributes.comments_count;
  const internalCommentCount = post.data.attributes.internal_comments_count;
  const commenting_idea =
    idea?.data.attributes.action_descriptors.commenting_idea;
  const commentingEnabled =
    postType === 'idea'
      ? commenting_idea?.enabled
      : initiativeCommentingPermissions?.enabled;

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

  if (showInternalComments && isInternalCommentingEnabled) {
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
                postType={postType}
                allowAnonymousParticipation={allowAnonymousParticipation}
                className={className}
              />
            </Box>
          )}
          {selectedTab === 'internal' && (
            <InternalComments
              postId={postId}
              postType={postType}
              className={className}
            />
          )}
        </Box>
      </Box>
    );
  }

  return (
    <PublicComments
      postId={postId}
      postType={postType}
      allowAnonymousParticipation={allowAnonymousParticipation}
      className={className}
    />
  );
};

export default CommentsSection;
