import React, { PureComponent, FormEvent, MouseEvent } from 'react';
import { get } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, switchMap, filter, tap } from 'rxjs/operators';

// components
import Comment from './Comment';
import ChildCommentForm from './ChildCommentForm';
import { Spinner } from 'cl2-component-library';

// services
import { childCommentsStream, IComments } from 'services/comments';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetPost, { GetPostChildProps } from 'resources/GetPost';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken, lighten } from 'polished';

const Container = styled.div`
  position: relative;
`;

const ParentCommentContainer = styled.div`
  position: relative;
`;

const LoadMoreText = styled.span`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  line-height: normal;
  text-decoration: underline;
  border: none;
  padding: 0;
  padding: 12px;
  margin: 0;
  transition: all 150ms ease-out;
`;

const LoadMore = styled.button`
  width: 100%;
  min-height: 45px;
  padding: 0;
  border: none;
  border-top: solid 1px #e8e8e8;
  border-bottom: solid 1px #e8e8e8;
  background: ${lighten(0.02, '#f0f0f1')};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease-out;
  margin-bottom: 20px;
  margin-left: 30px;

  &.clickable {
    cursor: pointer;

    &:hover {
      background: ${darken(0.01, '#f0f0f1')};

      ${LoadMoreText} {
        color: ${darken(0.25, colors.label)};
      }
    }
  }
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
  post: GetPostChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  canLoadMore: boolean;
  isLoadingMore: boolean;
  hasLoadedMore: boolean;
  childComments: IComments | null;
}

class ParentComment extends PureComponent<Props, State> {
  private loadMore$: BehaviorSubject<boolean>;
  private subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      canLoadMore: false,
      isLoadingMore: false,
      hasLoadedMore: false,
      childComments: null,
    };
  }

  componentDidMount() {
    this.loadMore$ = new BehaviorSubject(false);

    this.subscriptions = [
      this.loadMore$
        .pipe(
          distinctUntilChanged(),
          filter((loadMore) => loadMore),
          tap(() => this.setState({ isLoadingMore: true })),
          switchMap(() => {
            return childCommentsStream(this.props.commentId, {
              queryParameters: {
                'page[number]': 1,
                'page[size]': 500,
              },
            }).observable;
          })
        )
        .subscribe((childComments) => {
          this.setState({
            childComments,
            isLoadingMore: false,
            hasLoadedMore: true,
          });
        }),
    ];
  }

  componentDidUpdate(_prevProps: Props) {
    const currentComment = this.props.comment;

    if (
      !isNilOrError(currentComment) &&
      currentComment.attributes.children_count > 5 &&
      !this.state.canLoadMore
    ) {
      this.setState({ canLoadMore: true });
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  loadMore = (event: FormEvent<any>) => {
    if (!this.state.isLoadingMore) {
      event.preventDefault();
      trackEventByName(tracks.clickParentCommentLoadMoreButton);
      this.loadMore$.next(true);
    }
  };

  removeFocus = (event: MouseEvent) => {
    event.preventDefault();
  };

  render() {
    const {
      postId,
      postType,
      commentId,
      authUser,
      comment,
      post,
      className,
    } = this.props;
    const {
      canLoadMore,
      isLoadingMore,
      hasLoadedMore,
      childComments,
    } = this.state;

    if (!isNilOrError(comment) && !isNilOrError(post)) {
      const projectId: string | null = get(
        post,
        'relationships.project.data.id',
        null
      );
      const commentDeleted =
        comment.attributes.publication_status === 'deleted';
      const commentingEnabled = get(
        post,
        'attributes.action_descriptor.commenting.enabled',
        true
      );
      const showCommentForm = authUser && commentingEnabled && !commentDeleted;
      const hasChildComments =
        this.props.childCommentIds && this.props.childCommentIds.length > 0;
      const childCommentIds = !isNilOrError(childComments)
        ? childComments.data
            .filter(
              (comment) => comment.attributes.publication_status !== 'deleted'
            )
            .map((comment) => comment.id)
        : this.props.childCommentIds;
      const canReply = comment.attributes.publication_status !== 'deleted';
      const showLoadMore = canLoadMore && !hasLoadedMore;

      // hide parent comments that are deleted when they have no children
      if (
        comment.attributes.publication_status === 'deleted' &&
        !hasChildComments
      ) {
        return null;
      }

      return (
        <Container
          id="e2e-parent-and-childcomments"
          className={className || ''}
        >
          <ParentCommentContainer className={commentDeleted ? 'deleted' : ''}>
            <Comment
              postId={postId}
              postType={postType}
              projectId={projectId}
              commentId={comment.id}
              commentType="parent"
              hasChildComments={hasChildComments}
              canReply={canReply}
            />
          </ParentCommentContainer>

          {showLoadMore && (
            <LoadMore
              onMouseDown={this.removeFocus}
              onClick={this.loadMore}
              className={!isLoadingMore ? 'clickable' : ''}
            >
              {!isLoadingMore ? (
                <LoadMoreText>
                  <FormattedMessage {...messages.loadMoreComments} />
                </LoadMoreText>
              ) : (
                <Spinner size="25px" />
              )}
            </LoadMore>
          )}

          {childCommentIds &&
            childCommentIds.length > 0 &&
            childCommentIds.map((childCommentId, index) => (
              <Comment
                postId={postId}
                postType={postType}
                projectId={projectId}
                key={childCommentId}
                commentId={childCommentId}
                commentType="child"
                last={index === childCommentIds.length - 1}
                canReply={canReply}
              />
            ))}

          {showCommentForm && (
            <ChildCommentForm
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
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  comment: ({ commentId, render }) => (
    <GetComment id={commentId}>{render}</GetComment>
  ),
  post: ({ comment, postType, render }) => (
    <GetPost id={get(comment, 'relationships.post.data.id')} type={postType}>
      {render}
    </GetPost>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ParentComment {...inputProps} {...dataProps} />}
  </Data>
);
