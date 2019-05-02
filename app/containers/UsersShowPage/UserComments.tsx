import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import IdeaCommentGroup from './IdeaCommentGroup';

// resources
import GetCommentsForUser, { GetCommentsForUserChildProps } from 'resources/GetCommentsForUser';
import { ICommentData } from 'services/comments';

// style
import styled, { withTheme } from 'styled-components';
import Button from 'components/UI/Button';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { darken, rgba } from 'polished';
import { media } from 'utils/styleUtils';

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

interface InputProps {
  userId: string;
}

interface DataProps {
  comments: GetCommentsForUserChildProps;
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
    if (current.relationships.idea.data.id === lastArray[lastArray.length - 1].relationships.idea.data.id) {
      lastArray.push(current);
    } else {
      acc.push([current]);
    }
  }
  return acc;

};

export const UserComments = memo<Props>(({ comments, userId, theme }) => (
  !isNilOrError(comments.commentsList) && comments.commentsList.length > 0) ? (
    <Container>
      {comments.commentsList.reduce(reducer, [[]]).map(commentForIdea => (
        <IdeaCommentGroup
          key={commentForIdea[0].relationships.idea.data.id}
          ideaId={commentForIdea[0].relationships.idea.data.id}
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
  ) : null
);

const Data = adopt<DataProps, InputProps>({
  comments: ({ userId, render }) =>  <GetCommentsForUser userId={userId}>{render}</GetCommentsForUser>
});

const UserCommentsWithHocs = withTheme<Props, {}>(UserComments);

const WrappedUserComments = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <UserCommentsWithHocs {...inputProps} {...dataProps} />}
  </Data>
);

export default WrappedUserComments;
