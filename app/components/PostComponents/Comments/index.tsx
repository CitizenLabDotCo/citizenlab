// libraries
import React, { memo, useState, useCallback } from 'react';
import { adopt } from 'react-adopt';
import Observer from '@researchgate/react-intersection-observer';

// resources
import GetComments, { GetCommentsChildProps } from 'resources/GetComments';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import LoadingComments from './LoadingComments';
import IdeaParentCommentForm from './ParentCommentForm/IdeaParentCommentForm';
import InitiativeParentCommentForm from './ParentCommentForm/InitiativeParentCommentForm';
import Comments from './Comments';
import IdeaCommentingWarnings from './CommentingWarnings/IdeaCommentingWarnings';
import InitiativeCommentingWarnings from './CommentingWarnings/InitiativeCommentingWarnings';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// typings
import { CommentsSort } from 'services/comments';

const Container = styled.div``;

const LoadMore = styled.div`
  width: 100%;
  height: 0px;
`;

const LoadingMore = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
`;

const LoadingMoreMessage = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.medium}px;
  font-weight: 400;
`;

export interface InputProps {
  className?: string;
  postId: string;
  postType: 'idea' | 'initiative';
}

interface DataProps {
  comments: GetCommentsChildProps;
}

interface Props extends InputProps, DataProps {}

const CommentsSection = memo<Props>(({ postId, postType, comments, className }) => {
  const [sortOrder, setSortOrder] = useState<CommentsSort>('-new');
  const [posting, setPosting] = useState(false);
  const { commentsList, hasMore, onLoadMore, loadingInital, loadingMore, onChangeSort } = comments;

  const handleSortOrderChange = useCallback(
    (sortOrder: CommentsSort) => {
      onChangeSort(sortOrder);
      setSortOrder(sortOrder);
    }, []
  );

  const handleIntersection = useCallback(
    (event: IntersectionObserverEntry, unobserve: () => void) => {
      if (event.isIntersecting) {
        onLoadMore();
        unobserve();
      }
    }, []
  );

  const handleCommentPosting = useCallback(
    (isPosting: boolean) => {
      setPosting(isPosting);
    }, []
  );

  const commentingWarnings = () => {
    return ({
      idea: <IdeaCommentingWarnings ideaId={postId} />,
      initiative: <InitiativeCommentingWarnings initiativeId={postId} />
    })[postType];
  };

  const parentCommentForm = () => {
    return ({
      idea: (
        <IdeaParentCommentForm
          ideaId={postId}
          postingComment={handleCommentPosting}
        />
      ),
      initiative: (
        <InitiativeParentCommentForm
          initiativeId={postId}
          postingComment={handleCommentPosting}
        />
      )
    })[postType];
  };

  return (
    <Container className={className}>
      {(!isNilOrError(commentsList)) ? (
        <>
          {commentingWarnings()}

          <Comments
            postType={postType}
            comments={commentsList}
            sortOrder={sortOrder}
            loading={loadingInital}
            onSortOrderChange={handleSortOrderChange}
          />

          {hasMore && !loadingMore &&
            <Observer onChange={handleIntersection} rootMargin="3000px">
              <LoadMore />
            </Observer>
          }

          {loadingMore && !posting &&
            <LoadingMore>
              <LoadingMoreMessage>
                <FormattedMessage {...messages.loadingMoreComments} />
              </LoadingMoreMessage>
            </LoadingMore>
          }

          {parentCommentForm()}
        </>
      ) : (
        <LoadingComments />
      )}
    </Container>
  );
});

const Data = adopt<DataProps, InputProps>({
  comments: ({ postId, postType, render }) => <GetComments postId={postId} postType={postType}>{render}</GetComments>,
});

export default memo<InputProps>((inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <CommentsSection {...inputProps} {...dataProps} />}
  </Data>
));
