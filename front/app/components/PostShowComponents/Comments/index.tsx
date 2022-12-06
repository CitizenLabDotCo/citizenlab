// libraries
import Observer from '@researchgate/react-intersection-observer';
import React, { memo, useState, useCallback } from 'react';
import { adopt } from 'react-adopt';
import { Title } from '@citizenlab/cl2-component-library';
import { get, isUndefined } from 'lodash-es';
import GetComments, { GetCommentsChildProps } from 'resources/GetComments';
// resources
import GetPost, { GetPostChildProps } from 'resources/GetPost';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
// typings
import { CommentsSort } from 'services/comments';
import { IdeaCommentingDisabledReason } from 'services/ideas';
// analytics
import { trackEventByName } from 'utils/analytics';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
// utils
import { isNilOrError } from 'utils/helperUtils';
import { colors, fontSizes, media, isRtl } from 'utils/styleUtils';
// style
import styled from 'styled-components';
import CommentSorting from './CommentSorting';
import CommentingDisabled from './CommentingDisabled';
import CommentingInitiativeDisabled from './CommentingInitiativeDisabled';
import Comments from './Comments';
// components
import ParentCommentForm from './ParentCommentForm';
import messages from './messages';
import tracks from './tracks';

const Container = styled.div``;

const StyledParentCommentForm = styled(ParentCommentForm)`
  margin-bottom: 25px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const CommentCount = styled.span`
  margin-left: 5px;
`;

const StyledCommentSorting = styled(CommentSorting)`
  display: flex;
  justify-content: flex-end;

  ${media.phone`
    justify-content: flex-start;
  `}
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
  color: ${colors.textSecondary};
  font-size: ${fontSizes.m}px;
  font-weight: 400;
`;

export interface InputProps {
  postId: string;
  postType: 'idea' | 'initiative';
  className?: string;
}

interface DataProps {
  post: GetPostChildProps;
  comments: GetCommentsChildProps;
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

const CommentsSection = memo<Props>(
  ({ postId, postType, post, comments, project, className }) => {
    const [sortOrder, setSortOrder] = useState<CommentsSort>('-new');
    const [posting, setPosting] = useState(false);
    const {
      commentsList,
      hasMore,
      onLoadMore,
      loadingInital,
      loadingMore,
      onChangeSort,
    } = comments;

    const handleSortOrderChange = useCallback((sortOrder: CommentsSort) => {
      trackEventByName(tracks.clickCommentsSortOrder);
      onChangeSort(sortOrder);
      setSortOrder(sortOrder);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleIntersection = useCallback(
      (event: IntersectionObserverEntry, unobserve: () => void) => {
        if (event.isIntersecting) {
          onLoadMore();
          unobserve();
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    const handleCommentPosting = useCallback((isPosting: boolean) => {
      setPosting(isPosting);
    }, []);

    if (
      !isNilOrError(post) &&
      !isNilOrError(commentsList) &&
      !isUndefined(project)
    ) {
      const commentingEnabled = get(
        post,
        'attributes.action_descriptor.commenting_idea.enabled',
        true
      ) as boolean;
      const commentingDisabledReason = get(
        post,
        'attributes.action_descriptor.commenting_idea.disabled_reason',
        null
      ) as IdeaCommentingDisabledReason | null;
      const phaseId = isNilOrError(project)
        ? undefined
        : project.relationships?.current_phase?.data?.id;
      const commentCount = post.attributes.comments_count;

      return (
        <Container className={className || ''}>
          <Header>
            <Title color="tenantText" variant="h2" id="comments-main-title">
              <FormattedMessage {...messages.invisibleTitleComments} />
              {commentCount > 0 && (
                <CommentCount>({commentCount})</CommentCount>
              )}
            </Title>
            <StyledCommentSorting
              onChange={handleSortOrderChange}
              selectedValue={[sortOrder]}
            />
          </Header>

          {postType === 'idea' ? (
            <CommentingDisabled
              commentingEnabled={commentingEnabled}
              commentingDisabledReason={commentingDisabledReason}
              projectId={get(post, 'relationships.project.data.id')}
              phaseId={phaseId}
              postId={postId}
              postType={postType}
            />
          ) : (
            <CommentingInitiativeDisabled />
          )}

          <StyledParentCommentForm
            postId={postId}
            postType={postType}
            postingComment={handleCommentPosting}
          />

          <Comments
            postId={postId}
            postType={postType}
            allComments={commentsList}
            loading={loadingInital}
          />

          {hasMore && !loadingMore && (
            <Observer onChange={handleIntersection} rootMargin="3000px">
              <LoadMore />
            </Observer>
          )}

          {loadingMore && !posting && (
            <LoadingMore>
              <LoadingMoreMessage>
                <FormattedMessage {...messages.loadingMoreComments} />
              </LoadingMoreMessage>
            </LoadingMore>
          )}
        </Container>
      );
    }

    return null;
  }
);

const Data = adopt<DataProps, InputProps>({
  post: ({ postId, postType, render }) => (
    <GetPost id={postId} type={postType}>
      {render}
    </GetPost>
  ),
  comments: ({ postId, postType, render }) => (
    <GetComments postId={postId} postType={postType}>
      {render}
    </GetComments>
  ),
  project: ({ post, render }) => (
    <GetProject projectId={get(post, 'relationships.project.data.id')}>
      {render}
    </GetProject>
  ),
});

export default memo<InputProps>((inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <CommentsSection {...inputProps} {...dataProps} />}
  </Data>
));
