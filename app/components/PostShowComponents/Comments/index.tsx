// libraries
import React, { memo, useState, useCallback, useMemo } from 'react';
import { get, isUndefined, isEmpty } from 'lodash-es';
import { adopt } from 'react-adopt';
import Observer from '@researchgate/react-intersection-observer';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetPost, { GetPostChildProps } from 'resources/GetPost';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetComments, { GetCommentsChildProps } from 'resources/GetComments';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'services/permissions/roles';

// components
import ParentCommentForm from './ParentCommentForm';
import Comments from './Comments';
import CommentingDisabled from './CommentingDisabled';
import Warning from 'components/UI/Warning';
import CommentSorting from './CommentSorting';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

// typings
import { CommentsSort } from 'services/comments';
import { IdeaCommentingDisabledReason } from 'services/ideas';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

const Container = styled.div``;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
`;

const Title = styled.h2`
  font-size: ${fontSizes.xxxl}px;
  font-weight: 500;
  line-height: 40px;
  color: ${(props: any) => props.theme.colorText};
`;

const CommentCount = styled.span``;

const StyledCommentSorting = styled(CommentSorting)`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;

  ${media.smallerThanMinTablet`
    justify-content: flex-start;
    margin-bottom: 15px;
  `}
`;

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

const CommentsSection = memo<Props>(
  ({ postId, postType, authUser, post, comments, project, className }) => {
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
    }, []);

    const handleIntersection = useCallback(
      (event: IntersectionObserverEntry, unobserve: () => void) => {
        if (event.isIntersecting) {
          onLoadMore();
          unobserve();
        }
      },
      []
    );

    const handleCommentPosting = useCallback((isPosting: boolean) => {
      setPosting(isPosting);
    }, []);

    const sortedParentComments = useMemo(() => {
      if (!isNilOrError(commentsList) && commentsList.length > 0) {
        return commentsList.filter(
          (comment) => comment.relationships.parent.data === null
        );
      }
      return null;
    }, [sortOrder, comments]);

    if (
      !isNilOrError(post) &&
      !isNilOrError(commentsList) &&
      !isUndefined(project)
    ) {
    const commentingEnabled = get(
      post,
      'attributes.action_descriptor.commenting.enabled',
      true
    ) as boolean;
    const commentingDisabledReason = get(
      post,
      'attributes.action_descriptor.commenting.disabled_reason',
      null
    ) as IdeaCommentingDisabledReason | null;
    const userIsAdmin = !isNilOrError(authUser)
      ? isAdmin({ data: authUser })
      : false;
    const phaseId = isNilOrError(project)
      ? undefined
      : project.relationships?.current_phase?.data?.id;
    const commentCount = commentsList.length;

    return (
      <Container className={className || ''}>
        {/*
          Show warning messages when there are no comments and you're logged in as an admin.
          Otherwise the comment section would be empty (because admins don't see the parent comment box), which might look weird or confusing
        */}
        {isEmpty(commentsList) && userIsAdmin && (
          <StyledWarning>
            <FormattedMessage {...messages.noComments} />
          </StyledWarning>
        )}

        <CommentingDisabled
          commentingEnabled={commentingEnabled}
          commentingDisabledReason={commentingDisabledReason}
          projectId={get(post, 'relationships.project.data.id')}
          phaseId={phaseId}
          postId={postId}
          postType={postType}
        />

        <Header>
          <Title>
            <FormattedMessage {...messages.invisibleTitleComments} />
            {' '}
            <CommentCount>({commentCount})</CommentCount>
          </Title>
          {sortedParentComments && sortedParentComments.length > 0 && (
            <StyledCommentSorting
              onChange={handleSortOrderChange}
              selectedValue={[sortOrder]}
            />
          )}
        </Header>

        <ParentCommentForm
          postId={postId}
          postType={postType}
          postingComment={handleCommentPosting}
        />

        <Comments
          postId={postId}
          postType={postType}
          comments={commentsList}
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
});

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
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
