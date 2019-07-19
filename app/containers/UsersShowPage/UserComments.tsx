import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import IdeaCommentGroup from './IdeaCommentGroup';
import Button from 'components/UI/Button';

// resources
import GetCommentsForUser, { GetCommentsForUserChildProps } from 'resources/GetCommentsForUser';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// style
import styled, { withTheme } from 'styled-components';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { darken, rgba } from 'polished';
import { media, colors, fontSizes } from 'utils/styleUtils';

// typings
import { ICommentData } from 'services/comments';

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

export const reducer = (acc: ICommentData[][], current: ICommentData) => {
  const accLen = acc.length;
  const lastArray = acc[accLen - 1];

  if (lastArray.length === 0) {
    return [[current]];
  }

  if (current.attributes.publication_status === 'published') {
    if (current.relationships.post.data.id === lastArray[lastArray.length - 1].relationships.post.data.id) {
      lastArray.push(current);
    } else {
      acc.push([current]);
    }
  }
  return acc;

};

export const UserComments = memo<Props>(({ comments, comments: { commentsList }, userId, theme, authUser }) => (
  !isNilOrError(commentsList) && commentsList.length > 0) ? (
    <Container className="e2e-profile-comments">
      {commentsList.reduce(reducer, [[]]).map(commentForIdea => (
        <IdeaCommentGroup
          key={commentForIdea[0].id}
          ideaId={commentForIdea[0].relationships.post.data.id}
          commentsForIdea={commentForIdea}
          userId={userId}
        />
      ))}
      {comments.hasMore &&
        <Footer>
          <Button
            onClick={comments.loadMore}
            processing={comments.loadingMore}
            icon="showMore"
            textColor={theme.colorText}
            textHoverColor={darken(0.1, theme.colorText)}
            bgColor={rgba(theme.colorText, 0.08)}
            bgHoverColor={rgba(theme.colorText, 0.12)}
            height="50px"
          >
            <FormattedMessage {...messages.loadMoreComments} />
          </Button>
        </Footer>
      }
    </Container>
  ) : (commentsList === undefined ? (
    <MessageContainer>
        <FormattedMessage {...messages.loadingComments} />
    </MessageContainer>
  ) : (commentsList === null || Array.isArray(commentsList) && commentsList.length === 0 ? (
    !isNilOrError(authUser) && userId === authUser.id ? (
      <MessageContainer>
        <FormattedMessage {...messages.noCommentsForYou} />
      </MessageContainer>
    ) : (
      <MessageContainer>
        <FormattedMessage {...messages.noCommentsForUser} />
      </MessageContainer>
    )
  ) : (
    <MessageContainer>
        <FormattedMessage {...messages.tryAgain} />
    </MessageContainer>
  ))
  )
);

const Data = adopt<DataProps, InputProps>({
  comments: ({ userId, render }) =>  <GetCommentsForUser userId={userId}>{render}</GetCommentsForUser>,
  authUser: <GetAuthUser />
});

const UserCommentsWithHocs = withTheme(UserComments);

const WrappedUserComments = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <UserCommentsWithHocs {...inputProps} {...dataProps} />}
  </Data>
);

export default WrappedUserComments;
