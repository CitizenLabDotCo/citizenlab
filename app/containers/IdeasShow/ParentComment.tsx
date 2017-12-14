import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import ChildComment from './ChildComment';
import Author from './Author';
import Button from 'components/UI/Button';
import ChildCommentForm from './ChildCommentForm';

// services
import { authUserStream } from 'services/auth';
import { commentsForIdeaStream, commentStream, IComments, IComment } from 'services/comments';
import { IUser } from 'services/users';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from './messages';

// analytics
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// animations
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

// style
import styled, { css } from 'styled-components';

const timeout = 550;

const Container = styled.div`
  margin-top: 20px;
  -webkit-backface-visibility: hidden;
  will-change: auto;

  &.comment-enter {
    opacity: 0;
    transform: translateY(-20px);
    will-change: opacity, transform;

    &.comment-enter-active {
      opacity: 1;
      transform: translateX(0);
      transition: opacity ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1),
                  transform ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }
`;

const CommentContainer: any = styled.div`
  border: solid 1px #e4e4e4;
  border-radius: 6px;
  background: #fff;

  ${(props: any) => props.withReplyBox && css`
    border-bottom: none;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
  `}
`;

const CommentContainerInner = styled.div`
  padding: 30px;
`;

const StyledAuthor = styled(Author)`
  margin-bottom: 25px;
`;

const CommentBody = styled.div`
  color: #333;
  font-size: 18px;
  line-height: 26px;
  font-weight: 400;
  margin-bottom: 5px;

  span, p {
    white-space: pre-wrap;
    word-break: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    margin-bottom: 25px;
  }
`;

const ChildCommentsContainer = styled.div``;

type Props = {
  ideaId: string;
  commentId: string;
  animate?: boolean | undefined;
};

type State = {
  authUser: IUser | null;
  comment: IComment | null;
  childCommentIds: string[] | null;
  showForm: boolean;
};

type Tracks = {
  clickReply: Function;
};

class ParentComment extends React.PureComponent<Props & Tracks, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      authUser: null,
      comment: null,
      childCommentIds: null,
      showForm: false,
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { ideaId, commentId, animate } = this.props;
    const authUser$ = authUserStream().observable;
    const comment$ = commentStream(commentId).observable;
    const childCommentIds$ = commentsForIdeaStream(ideaId).observable.switchMap((comments) => {
      const childCommentIds = comments.data.filter((comment) => {
        return (comment.relationships.parent.data !== null ? comment.relationships.parent.data.id === commentId : false);
      }).map(comment => comment.id);

      if (childCommentIds && childCommentIds.length > 0) {
        return Rx.Observable.of(childCommentIds);
      }

      return Rx.Observable.of(null);
    });

    this.subscriptions = [
      Rx.Observable.combineLatest(
        authUser$,
        comment$,
        childCommentIds$
      ).delayWhen(() => {
        return (animate === true ? Rx.Observable.timer(100) : Rx.Observable.of(null));
      }).subscribe(([authUser, comment, childCommentIds]) => {
        this.setState({
          authUser,
          comment,
          childCommentIds
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

  render() {
    let returnValue: JSX.Element | null = null;
    const { commentId, animate } = this.props;
    const { authUser, comment, childCommentIds, showForm } = this.state;

    if (comment) {
      const ideaId = comment.data.relationships.idea.data.id;
      const authorId = comment.data.relationships.author.data ? comment.data.relationships.author.data.id : null;
      const createdAt = comment.data.attributes.created_at;
      const commentBodyMultiloc = comment.data.attributes.body_multiloc;
      const isLoggedIn = !_.isNull(authUser);
      const parentComment = (
        <Container className="e2e-comment-thread">

          <CommentContainer withReplyBox={isLoggedIn}>
            <CommentContainerInner>
              <StyledAuthor authorId={authorId} createdAt={createdAt} message="parentCommentAuthor" />

              <CommentBody className="e2e-comment-body">
                <T value={commentBodyMultiloc} />
              </CommentBody>
            </CommentContainerInner>

            <ChildCommentsContainer>
              {childCommentIds && childCommentIds.map((childCommentId) => {
                return (<ChildComment key={childCommentId} commentId={childCommentId} />);
              })}
            </ChildCommentsContainer>
          </CommentContainer>

          {authUser &&
            <ChildCommentForm ideaId={ideaId} parentId={commentId} />
          }

        </Container>
      );

      if (animate === true) {
        returnValue = (
          <CSSTransition classNames="comment" timeout={timeout}>
            {parentComment}
          </CSSTransition>
        );
      } else {
        returnValue = parentComment;
      }
    }

    return (
      <TransitionGroup>
        {returnValue}
      </TransitionGroup>
    );
  }
}

export default injectTracks<Props>({
  clickReply: tracks.clickReply,
})(ParentComment);
