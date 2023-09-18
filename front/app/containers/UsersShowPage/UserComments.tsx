import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { groupBy } from 'lodash-es';

// components
import PostCommentGroup from './PostCommentGroup';
import Button from 'components/UI/Button';
import { Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import useUserBySlug from 'api/users/useUserBySlug';

// style
import styled, { useTheme } from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { darken, rgba } from 'polished';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import useComments from 'api/comments/useComments';
import useAuthUser from 'api/me/useAuthUser';
import useUserCommentsCount from 'api/user_comments_count/useUserCommentsCount';

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
      (comment) => comment.relationships.post.data.id
    );

    return (
      <Container className="e2e-profile-comments">
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
            const postType = commentGroup[0].relationships.post.data.type as
              | 'idea'
              | 'initiative';

            return (
              <PostCommentGroup
                key={postId}
                postId={postId}
                postType={postType}
                comments={commentGroup}
                userId={user.data.id}
              />
            );
          })}
        </>

        {hasNextPage && (
          <Footer>
            <Button
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
            </Button>
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
