import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { groupBy } from 'lodash-es';

// components
import PostCommentGroup from './PostCommentGroup';
import Button from 'components/UI/Button';

// resources

// style
import styled, { useTheme } from 'styled-components';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { darken, rgba } from 'polished';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import useComments from 'api/comments/useComments';
import useAuthUser from 'api/me/useAuthUser';
import { Title, useBreakpoint } from '@citizenlab/cl2-component-library';
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

interface Props {
  userId: string;
}

export const UserComments = ({ userId }: Props) => {
  const theme = useTheme();
  const isMobileOrSmaller = useBreakpoint('phone');
  const { data: authUser } = useAuthUser();
  const {
    data: comments,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useComments({ authorId: userId });
  const { data: commentsCount } = useUserCommentsCount({
    userId,
  });
  const commentsList = comments?.pages.flatMap((page) => page.data);

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
    if (!isNilOrError(authUser) && userId === authUser.data.id) {
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
          {isMobileOrSmaller && (
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
                userId={userId}
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
