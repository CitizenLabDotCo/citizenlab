import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// components
import ChildComment from './ChildComment';
import Author from './Author';
import ChildCommentForm from './ChildCommentForm';
import CommentsMoreActions from './CommentsMoreActions';
import CommentBody from './CommentBody';
import { browserHistory } from 'react-router';
import Icon from 'components/UI/Icon';

// services
import { authUserStream } from 'services/auth';
import { commentsForIdeaStream, commentStream, IComment, updateComment } from 'services/comments';
import { ideaByIdStream } from 'services/ideas';
import { IUser } from 'services/users';

// analytics
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// animations
// import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { Locale, API } from 'typings';

const timeout = 550;

const DeletedIcon = styled(Icon)`
  height: 1em;
  margin-right: 1rem;
  width: 1em;
`;

const StyledMoreActionsMenu = styled(CommentsMoreActions)`
  position: absolute;
  top: 10px;
  right: 20px;
`;

const Container = styled.div`
  margin-top: 35px;

  &.comment-enter {
    opacity: 0;
    transform: translateY(-20px);

    &.comment-enter-active {
      opacity: 1;
      transform: translateX(0);
      transition: opacity ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1),
                  transform ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }
`;

const CommentsWithReplyBoxContainer = styled.div`
  border-radius: 5px;
`;

const CommentsContainer = styled.div`
  border-radius: 5px;
  position: relative;
  border: solid 1px #ddd;
  background: #fff;

  &.hasReplyBox {
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
    border-bottom: none;
  }
`;

const CommentContainerInner = styled.div`
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 30px;
  padding-bottom: 30px;
  position: relative;

  &.deleted {
    display: flex;
    align-items: center;
    background: ${colors.placeholderBg};
  }
`;

const StyledAuthor = styled(Author)`
  margin-bottom: 20px;
`;

const ChildCommentsContainer = styled.div``;

type Props = {
  ideaId: string;
  commentId: string;
  animate?: boolean | undefined;
};

type State = {
  locale: Locale | null;
  currentTenantLocales: Locale[] | null;
  authUser: IUser | null;
  comment: IComment | null;
  childCommentIds: string[] | null;
  showForm: boolean;
  spamModalVisible: boolean;
  commentingEnabled: boolean | null;
  loaded: boolean;
  editionMode: boolean;
};

type Tracks = {
  clickReply: Function;
};

class ParentComment extends React.PureComponent<Props & Tracks, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenantLocales: null,
      authUser: null,
      comment: null,
      childCommentIds: null,
      showForm: false,
      spamModalVisible: false,
      commentingEnabled: null,
      loaded: false,
      editionMode: false,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { ideaId, commentId, animate } = this.props;
    const authUser$ = authUserStream().observable;
    const comment$ = commentStream(commentId).observable;
    const childCommentIds$ = commentsForIdeaStream(ideaId).observable.switchMap((comments) => {
      const childCommentIds = comments.data.filter((comment) => {
        if (!comment.relationships.parent.data) return false;
        if (comment.attributes.publication_status === 'deleted') return false;
        if (comment.relationships.parent.data.id === commentId) return true;
        return false;
      }).map(comment => comment.id);

      if (childCommentIds && childCommentIds.length > 0) {
        return Rx.Observable.of(childCommentIds);
      }

      return Rx.Observable.of(null);
    });
    const idea$ = ideaByIdStream(ideaId).observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        authUser$,
        comment$,
        childCommentIds$,
        idea$,
      ).delayWhen(() => {
        return (animate === true ? Rx.Observable.timer(100) : Rx.Observable.of(null));
      }).subscribe(([authUser, comment, childCommentIds, idea]) => {
        this.setState({
          authUser,
          comment,
          childCommentIds,
          commentingEnabled: idea.data.relationships.action_descriptor.data.commenting.enabled,
          loaded: true
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  toggleForm = () => {
    this.props.clickReply();
    this.setState({ showForm: true });
  }

  captureClick = (event) => {
    if (event.target.classList.contains('mention')) {
      event.preventDefault();
      const link = event.target.getAttribute('data-link');
      browserHistory.push(link);
    }
  }

  onCommentEdit = () => {
    this.setState({ editionMode: true });
  }

  onCancelEdition = () => {
    this.setState({ editionMode: false });
  }

  onCommentSave = (comment, formikActions) => {
    const { setSubmitting, setErrors } = formikActions;

    updateComment(this.props.commentId, comment)
    .then(() => {
      this.setState({ editionMode: false });
    })
    .catch((errorResponse) => {
      if (errorResponse.json) {
        const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      }
    });
  }

  render() {
    const { commentId, animate } = this.props;
    const { loaded, authUser, comment, childCommentIds, commentingEnabled } = this.state;

    if (loaded && comment) {
      const ideaId = comment.data.relationships.idea.data.id;
      const authorId = comment.data.relationships.author.data ? comment.data.relationships.author.data.id : null;
      const commentDeleted = comment.data.attributes.publication_status === 'deleted';
      const createdAt = comment.data.attributes.created_at;
      const commentBodyMultiloc = comment.data.attributes.body_multiloc;
      const showCommentForm = authUser && commentingEnabled && !commentDeleted;

      // Hide parent comments that are deleted with no children
      if (comment.data.attributes.publication_status === 'deleted' && (!childCommentIds || childCommentIds.length === 0)) {
        return null;
      }

      return (
        <CSSTransition
          in={(animate === true)}
          classNames="comment"
          timeout={timeout}
          enter={(animate === true)}
          exit={false}
        >
          <Container className="e2e-comment-thread">

            <CommentsWithReplyBoxContainer>
              <CommentsContainer className={`${showCommentForm && 'hasReplyBox'}`}>
                <CommentContainerInner className={`${commentDeleted && 'deleted'}`}>
                  {!commentDeleted &&
                    <>
                      <StyledMoreActionsMenu comment={comment.data} onCommentEdit={this.onCommentEdit} />
                      <StyledAuthor authorId={authorId} createdAt={createdAt} message="parentCommentAuthor" />
                      <CommentBody commentBody={commentBodyMultiloc} editionMode={this.state.editionMode} onCommentSave={this.onCommentSave} onCancelEdition={this.onCancelEdition} />
                    </>
                  }
                  {commentDeleted &&
                    <>
                      <DeletedIcon name="delete" />
                      <FormattedMessage {...messages.commentDeletedPlaceholder} />
                    </>
                  }
                </CommentContainerInner>

                {(childCommentIds && childCommentIds.length > 0) &&
                  <ChildCommentsContainer>
                    {childCommentIds.map((childCommentId) => {
                      return (<ChildComment key={childCommentId} commentId={childCommentId} />);
                    })}
                  </ChildCommentsContainer>
                }
              </CommentsContainer>

              {showCommentForm &&
                <ChildCommentForm ideaId={ideaId} parentId={commentId} />
              }
            </CommentsWithReplyBoxContainer>
          </Container>
        </CSSTransition>
      );
    }

    return null;
  }
}

export default injectTracks<Props>({
  clickReply: tracks.clickReply,
})(ParentComment);
