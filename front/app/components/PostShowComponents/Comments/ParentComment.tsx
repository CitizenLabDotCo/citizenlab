import React, { FormEvent, useState, useEffect, useRef } from 'react';
import { get } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, switchMap, filter, tap } from 'rxjs/operators';

// components
import Comment from './Comment';
import ChildCommentForm from './ChildCommentForm';
import { Spinner } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// services
import { childCommentsStream, IComments } from 'services/comments';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetComment, { GetCommentChildProps } from 'resources/GetComment';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled, { withTheme } from 'styled-components';
import { darken } from 'polished';
import GetInitiativesPermissions, {
  GetInitiativesPermissionsChildProps,
} from 'resources/GetInitiativesPermissions';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useIdeaById from 'api/ideas/useIdeaById';

const Container = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const ParentCommentContainer = styled.div`
  position: relative;
`;

const StyledChildCommentForm = styled(ChildCommentForm)`
  margin-top: 30px;
  margin-left: 38px;
`;

const LoadMoreButton = styled(Button)`
  margin-top: 20px;
  margin-left: 38px;
`;

interface InputProps {
  postId: string;
  postType: 'idea' | 'initiative';
  commentId: string;
  childCommentIds: string[] | false;
  className?: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  comment: GetCommentChildProps;
  commentingPermissionInitiative: GetInitiativesPermissionsChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

const ParentComment = ({
  commentId,
  comment,
  postId,
  postType,
  authUser,
  className,
  commentingPermissionInitiative,
  theme,
  childCommentIds,
}: Props) => {
  const initiativeId = postType === 'initiative' ? postId : undefined;
  const ideaId = postType === 'idea' ? postId : undefined;
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: idea } = useIdeaById(ideaId);
  const post = initiative || idea;

  const loadMore$ = useRef(new BehaviorSubject(false));
  const subscriptions = useRef<Subscription[]>([]);
  const [canLoadMore, setCanLoadMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasLoadedMore, setHasLoadedMore] = useState(false);
  const [childComments, setChildComments] = useState<IComments | null>(null);

  useEffect(() => {
    loadMore$.current = new BehaviorSubject(false);

    subscriptions.current = [
      loadMore$.current
        .pipe(
          distinctUntilChanged(),
          filter((loadMore) => loadMore),
          tap(() => setHasLoadedMore(true)),
          switchMap(() => {
            return childCommentsStream(commentId, {
              queryParameters: {
                'page[number]': 1,
                'page[size]': 500,
              },
            }).observable;
          })
        )
        .subscribe((childComments) => {
          setChildComments(childComments);
          setIsLoadingMore(false);
          setHasLoadedMore(true);
        }),
    ];

    return () => {
      subscriptions.current.forEach((subscription) =>
        subscription.unsubscribe()
      );
    };
  });

  useEffect(() => {
    if (
      !isNilOrError(comment) &&
      comment.attributes.children_count > 5 &&
      !canLoadMore
    ) {
      setCanLoadMore(true);
    }
  }, [comment, canLoadMore]);

  const loadMore = (event: FormEvent<any>) => {
    if (!isLoadingMore) {
      event.preventDefault();
      trackEventByName(tracks.clickParentCommentLoadMoreButton);
      loadMore$.current.next(true);
    }
  };

  if (!isNilOrError(comment) && !isNilOrError(post)) {
    const projectId: string | null =
      idea?.data.relationships.project.data.id || null;
    const commentDeleted = comment.attributes.publication_status === 'deleted';
    const commentingEnabled =
      postType === 'initiative'
        ? commentingPermissionInitiative?.enabled === true
        : get(
            post,
            'attributes.action_descriptor.commenting_idea.enabled',
            true
          );
    const showCommentForm = authUser && commentingEnabled && !commentDeleted;
    const hasChildComments = childCommentIds && childCommentIds.length > 0;
    const modifiedChildCommentIds = !isNilOrError(childComments)
      ? childComments.data
          .filter(
            (comment) => comment.attributes.publication_status !== 'deleted'
          )
          .map((comment) => comment.id)
      : childCommentIds;
    const showLoadMore = canLoadMore && !hasLoadedMore;

    // hide parent comments that are deleted when they have no children
    if (
      comment.attributes.publication_status === 'deleted' &&
      !hasChildComments
    ) {
      return null;
    }

    return (
      <Container className={`${className || ''} e2e-parent-and-childcomments`}>
        <ParentCommentContainer className={commentDeleted ? 'deleted' : ''}>
          <Comment
            postId={postId}
            postType={postType}
            projectId={projectId}
            commentId={commentId}
            commentType="parent"
            hasChildComments={hasChildComments}
          />
        </ParentCommentContainer>

        {showLoadMore && (
          <LoadMoreButton
            onClick={loadMore}
            className={!isLoadingMore ? 'clickable' : ''}
            disabled={isLoadingMore}
            bgColor="white"
            textColor={theme.colors.tenantText}
            bgHoverColor="white"
            textHoverColor={darken(0.1, theme.colors.tenantText)}
            fontWeight="bold"
            borderColor="#E0E0E0"
            borderThickness="2px"
          >
            {!isLoadingMore ? (
              <FormattedMessage {...messages.loadMoreComments} />
            ) : (
              <Spinner size="25px" />
            )}
          </LoadMoreButton>
        )}

        {modifiedChildCommentIds &&
          modifiedChildCommentIds.length > 0 &&
          modifiedChildCommentIds.map((childCommentId, index) => (
            <Comment
              postId={postId}
              postType={postType}
              projectId={projectId}
              key={childCommentId}
              commentId={childCommentId}
              commentType="child"
              last={index === modifiedChildCommentIds.length - 1}
            />
          ))}

        {showCommentForm && (
          <StyledChildCommentForm
            postId={postId}
            postType={postType}
            projectId={projectId}
            parentId={commentId}
            waitForChildCommentsRefetch={!isNilOrError(childComments)}
          />
        )}
      </Container>
    );
  }

  return null;
};

const ParentCommentWithHoC = withTheme(ParentComment);

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  comment: ({ commentId, render }) => (
    <GetComment id={commentId}>{render}</GetComment>
  ),
  commentingPermissionInitiative: (
    <GetInitiativesPermissions action="commenting_initiative" />
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ParentCommentWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
