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
import Button from 'components/UI/Button';

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
import styled, { withTheme } from 'styled-components';
import { darken } from 'polished';
import GetInitiativesPermissions, {
  GetInitiativesPermissionsChildProps,
} from 'resources/GetInitiativesPermissions';

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
  post: GetPostChildProps;
  commentingPermissionInitiative: GetInitiativesPermissionsChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

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
      commentingPermissionInitiative,
      theme,
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
      const commentingEnabled =
        postType === 'initiative'
          ? commentingPermissionInitiative?.enabled === true
          : get(
              post,
              'attributes.action_descriptor.commenting_idea.enabled',
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
              commentId={commentId}
              commentType="parent"
              hasChildComments={hasChildComments}
            />
          </ParentCommentContainer>

          {showLoadMore && (
            <LoadMoreButton
              onClick={this.loadMore}
              className={!isLoadingMore ? 'clickable' : ''}
              disabled={isLoadingMore}
              bgColor="white"
              textColor={theme.colorText}
              bgHoverColor="white"
              textHoverColor={darken(0.1, theme.colorText)}
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
  }
}

const ParentCommentWithHoC = withTheme(ParentComment);

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
  commentingPermissionInitiative: (
    <GetInitiativesPermissions action="commenting_initiative" />
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ParentCommentWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
