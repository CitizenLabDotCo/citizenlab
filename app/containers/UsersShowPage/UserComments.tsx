import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import IdeaCommentGroup from './IdeaCommentGroup';

// resources
import GetCommentsForUser, { GetCommentsForUserChildProps } from 'resources/GetCommentsForUser';
import { ICommentData } from 'services/comments';

// style
import styled from 'styled-components';
import Button from 'components/UI/Button';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;

  max-width: 760px;
`;

interface InputProps {
  userId: string;
}

interface DataProps {
  comments: GetCommentsForUserChildProps;
}

interface Props extends InputProps, DataProps {}

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

export const UserComments = memo<Props>(({ comments, userId }) => (
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
        <Button
          onClick={comments.loadMore}
          processing={comments.loadingMore}
        >
          <FormattedMessage {...messages.loadMoreComments} />
        </Button>
      }
    </Container>
  ) : null
);

const Data = adopt<DataProps, InputProps>({
  comments: ({ userId, render }) =>  <GetCommentsForUser userId={userId}>{render}</GetCommentsForUser>
});

const WrappedUserComments = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <UserComments {...inputProps} {...dataProps} />}
  </Data>
);

export default WrappedUserComments;
