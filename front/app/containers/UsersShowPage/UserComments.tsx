import React from 'react';

import {
  Title,
  useBreakpoint,
  media,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { groupBy } from 'lodash-es';
import { darken, rgba } from 'polished';
import { useParams } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

import useComments from 'api/comments/useComments';
import useAuthUser from 'api/me/useAuthUser';
import useUserCommentsCount from 'api/user_comments_count/useUserCommentsCount';
import useUserBySlug from 'api/users/useUserBySlug';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';
import PostCommentGroup from './PostCommentGroup';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;

  max-width: 760px;
`;

const Footer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 30px;

  ${media.phone`
    flex-direction: column;
    align-items: stretch;
    margin-top: 0px;
  `}
`;

const MessageContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.textSecondary};
  font-size: ${fontSizes.m}px;
  font-weight: 400;
`;

export const UserComments = () => {
  const { userSlug } = useParams() as { userSlug: string };
  const { data: user } = useUserBySlug(userSlug);
  const theme = useTheme();
  const { data: authUser } = useAuthUser();
  const isSmallerThanPhone = useBreakpoint('phone');
  const { data: commentsCount } = useUserCommentsCount({
    userId: user?.data.id,
  });
  const {
    data: comments,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useComments({ authorId: user?.data.id });
  const commentsList = comments?.pages.flatMap((page) => page.data);

  if (!user) {
    return null;
  }

  if (commentsList === undefined) {
    return (
      <MessageContainer>
        <FormattedMessage {...messages.loadingComments} />
      </MessageContainer>
    );
  }

  if (
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    commentsList === null ||
    (!isNilOrError(commentsList) && commentsList.length === 0)
  ) {
    if (!isNilOrError(authUser) && user.data.id === authUser.data.id) {
      return (
        <MessageContainer>
          <FormattedMessage {...messages.noCommentsForYou} />
        </MessageContainer>
      );
    }

    return (
      <MessageContainer>
        <FormattedMessage {...messages.noCommentsForUser} />
      </MessageContainer>
    );
  }

  if (commentsList.length > 0) {
    const commentGroups = groupBy(
      commentsList,
      (comment) => comment.relationships.idea.data.id
    );

    return (
      <Container className="e2e-profile-comments" id="tab-comments">
        <ScreenReaderOnly>
          <FormattedMessage
            tagName="h2"
            {...messages.invisibleTitleUserComments}
          />
        </ScreenReaderOnly>
        <>
          {isSmallerThanPhone && (
            <Title mt="0px" variant="h3" as="h1">
              <FormattedMessage
                {...messages.commentsWithCount}
                values={{
                  commentsCount: commentsCount?.data.attributes.count || '0',
                }}
              />
            </Title>
          )}
          {Object.keys(commentGroups).map((postId) => {
            const commentGroup = commentGroups[postId];

            return (
              <PostCommentGroup
                key={postId}
                postId={postId}
                comments={commentGroup}
                userId={user.data.id}
              />
            );
          })}
        </>

        {hasNextPage && (
          <Footer>
            <ButtonWithLink
              onClick={() => fetchNextPage()}
              processing={isFetchingNextPage}
              icon="refresh"
              textColor={theme.colors.tenantText}
              textHoverColor={darken(0.1, theme.colors.tenantText)}
              bgColor={rgba(theme.colors.tenantText, 0.08)}
              bgHoverColor={rgba(theme.colors.tenantText, 0.12)}
              height="50px"
            >
              <FormattedMessage {...messages.loadMoreComments} />
            </ButtonWithLink>
          </Footer>
        )}
      </Container>
    );
  }

  return (
    <MessageContainer>
      <FormattedMessage {...messages.tryAgain} />
    </MessageContainer>
  );
};

export default UserComments;
