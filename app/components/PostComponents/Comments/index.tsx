// libraries
import React, { memo, useState, useCallback } from 'react';
import { get, isUndefined } from 'lodash-es';
import { adopt } from 'react-adopt';
import Observer from '@researchgate/react-intersection-observer';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetPost, { GetPostChildProps } from 'resources/GetPost';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetComments, { GetCommentsChildProps } from 'resources/GetComments';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import LoadingComments from './LoadingComments';
import ParentCommentForm from './ParentCommentForm';
import Comments from './Comments';
import CommentingDisabled from './CommentingDisabled';
import Warning from 'components/UI/Warning';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// typings
import { CommentsSort } from 'services/comments';

const Container = styled.div``;

const StyledWarning = styled(Warning)`
  margin-bottom: 20px;
`;

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
  postId: string;
  postType: 'idea' | 'initiative';
  className?: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  post: GetPostChildProps;
  comments: GetCommentsChildProps;
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

const CommentsSection = memo<Props>(({ postId, postType, authUser, post, comments, project, className }) => {
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

  const commentingEnabled: boolean = get(post, 'attributes.action_descriptor.commenting.enabled', true);
  const commentingDisabledReason = get(post, 'attributes.action_descriptor.commenting.disabled_reason', null);

  return (
    <Container className={className}>
      {(!isNilOrError(post) && !isNilOrError(commentsList) && !isUndefined(project)) ? (
        <>
          {/*
            Show warning messages when there are no comments and you're logged in as an admin.
            Otherwise the comment section would be empty (because admins don't see the parent comment box), which might look weird or confusing
          */}
          {true &&
            <StyledWarning>
              <FormattedMessage {...messages.noComments} />
            </StyledWarning>
          }

          <CommentingDisabled
            isLoggedIn={!!authUser}
            commentingEnabled={commentingEnabled}
            commentingDisabledReason={commentingDisabledReason}
            projectId={!isNilOrError(project) ? project.id : null}
          />

          <Comments
            postId={postId}
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

          <ParentCommentForm
            postId={postId}
            postType={postType}
            postingComment={handleCommentPosting}
          />
        </>
      ) : (
        <LoadingComments />
      )}
    </Container>
  );
});

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  post: ({ postId, postType, render }) => <GetPost id={postId} type={postType}>{render}</GetPost>,
  comments: ({ postId, postType, render }) => <GetComments postId={postId} postType={postType}>{render}</GetComments>,
  project: ({ post, render }) => <GetProject id={get(post, 'relationships.project.data.id')}>{render}</GetProject>
});

export default memo<InputProps>((inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <CommentsSection {...inputProps} {...dataProps} />}
  </Data>
));
