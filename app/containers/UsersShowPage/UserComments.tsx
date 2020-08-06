import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import { groupBy } from 'lodash-es';

// components
import PostCommentGroup from './PostCommentGroup';
import Button from 'components/UI/Button';

// resources
import GetCommentsForUser, {
  GetCommentsForUserChildProps,
} from 'resources/GetCommentsForUser';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// style
import styled, { withTheme } from 'styled-components';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { darken, rgba } from 'polished';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

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

  ${media.smallerThanMinTablet`
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
  color: ${colors.label};
  font-size: ${fontSizes.medium}px;
  font-weight: 400;
`;

const LoadMoreButton = styled(Button)``;

interface InputProps {
  userId: string;
}

interface DataProps {
  comments: GetCommentsForUserChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

export const UserComments = memo<Props>(
  ({ comments, userId, theme, authUser }) => {
    if (!isNilOrError(comments)) {
      const { commentsList } = comments;

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
        if (!isNilOrError(authUser) && userId === authUser.id) {
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

      if (!isNilOrError(commentsList) && commentsList.length > 0) {
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
              {Object.keys(commentGroups).map((postId) => {
                const commentGroup = commentGroups[postId];
                const postType = commentGroup[0].relationships.post.data
                  .type as 'idea' | 'initiative';

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

            {comments.hasMore && (
              <Footer>
                <LoadMoreButton
                  onClick={comments.loadMore}
                  processing={comments.loadingMore}
                  icon="showMore"
                  iconAriaHidden
                  textColor={theme.colorText}
                  textHoverColor={darken(0.1, theme.colorText)}
                  bgColor={rgba(theme.colorText, 0.08)}
                  bgHoverColor={rgba(theme.colorText, 0.12)}
                  height="50px"
                >
                  <FormattedMessage {...messages.loadMoreComments} />
                </LoadMoreButton>
              </Footer>
            )}
          </Container>
        );
      }
    }

    return (
      <MessageContainer>
        <FormattedMessage {...messages.tryAgain} />
      </MessageContainer>
    );
  }
);

const Data = adopt<DataProps, InputProps>({
  comments: ({ userId, render }) => (
    <GetCommentsForUser userId={userId}>{render}</GetCommentsForUser>
  ),
  authUser: <GetAuthUser />,
});

const UserCommentsWithHocs = withTheme(UserComments);

const WrappedUserComments = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <UserCommentsWithHocs {...inputProps} {...dataProps} />}
  </Data>
);

export default WrappedUserComments;
