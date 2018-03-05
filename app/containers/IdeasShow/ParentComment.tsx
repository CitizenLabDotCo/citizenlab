import * as React from 'react';
import * as Rx from 'rxjs/Rx';

import linkifyHtml from 'linkifyjs/html';

// components
import ChildComment from './ChildComment';
import Author from './Author';
import ChildCommentForm from './ChildCommentForm';
import { browserHistory } from 'react-router';
import Modal from 'components/UI/Modal';
import SpamReportForm from 'containers/SpamReport';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';

// services
import { authUserStream } from 'services/auth';
import { commentsForIdeaStream, commentStream, IComment } from 'services/comments';
import { ideaByIdStream } from 'services/ideas';
import { IUser } from 'services/users';
import { getLocalized } from 'utils/i18n';
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// analytics
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// animations
// import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

// style
import styled from 'styled-components';
import { transparentize, darken } from 'polished';
import { Locale } from 'typings';
import { media } from 'utils/styleUtils';

const timeout = 550;

const StyledMoreActionsMenu: any = styled(MoreActionsMenu)`
  position: absolute;
  top: 10px;
  right: 20px;
  opacity: 0;
  transition: opacity 100ms ease-out;

  ${media.smallerThanMaxTablet`
    opacity: 1;
  `}
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
  border: solid 1px #e4e4e4;
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

  &:hover {
    ${StyledMoreActionsMenu} {
      opacity: 1;
    }
  }
`;

const StyledAuthor = styled(Author)`
  margin-bottom: 20px;
`;

const CommentBody = styled.div`
  color: #333;
  font-size: 17px;
  line-height: 25px;
  font-weight: 300;

  span,
  p {
    /* white-space: pre-wrap;
    word-break: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto; */
    margin-bottom: 25px;

    &:last-child {
      margin-bottom: 0px;
    }
  }

  a {
    color: ${(props) => props.theme.colors.clBlue};

    &.mention {
      background: ${props => transparentize(0.92, props.theme.colors.clBlue)};
    }

    &:hover {
      color: ${(props) => darken(0.15, props.theme.colors.clBlue)};
      text-decoration: underline;
    }
  }
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
  moreActions: IAction[];
  commentingEnabled: boolean | null;
  loaded: boolean;
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
      moreActions: [],
      commentingEnabled: null,
      loaded: false
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { ideaId, commentId, animate } = this.props;
    const locale$ = localeStream().observable;
    const currentTenantLocales$ = currentTenantStream().observable.map(currentTenant => currentTenant.data.attributes.settings.core.locales);
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
    const idea$ = ideaByIdStream(ideaId).observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenantLocales$,
        authUser$,
        comment$,
        childCommentIds$,
        idea$,
      ).delayWhen(() => {
        return (animate === true ? Rx.Observable.timer(100) : Rx.Observable.of(null));
      }).subscribe(([locale, currentTenantLocales, authUser, comment, childCommentIds, idea]) => {
        let moreActions = this.state.moreActions;

        if (authUser) {
          moreActions = [
            ...this.state.moreActions,
            { label: <FormattedMessage {...messages.reportAsSpam} />, handler: this.openSpamModal }
          ];
        }

        this.setState({
          locale,
          currentTenantLocales,
          authUser,
          comment,
          childCommentIds,
          moreActions,
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

  openSpamModal = () => {
    this.setState({ spamModalVisible: true });
  }

  closeSpamModal = () => {
    this.setState({ spamModalVisible: false });
  }

  render() {
    const { commentId, animate } = this.props;
    const { loaded, locale, currentTenantLocales, authUser, comment, childCommentIds, commentingEnabled } = this.state;

    if (loaded && locale && currentTenantLocales && comment) {
      const ideaId = comment.data.relationships.idea.data.id;
      const authorId = comment.data.relationships.author.data ? comment.data.relationships.author.data.id : null;
      const createdAt = comment.data.attributes.created_at;
      const commentBodyMultiloc = comment.data.attributes.body_multiloc;
      const commentText = getLocalized(commentBodyMultiloc, locale, currentTenantLocales);
      const processedCommentText = linkifyHtml(commentText.replace(
        /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>([\S\s]*?)<\/span>/gi,
        '<a class="mention" data-link="/profile/$2" href="/profile/$2">$3</a>'
      ));
      const showCommentForm = authUser && commentingEnabled;

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
                <CommentContainerInner>
                  <StyledMoreActionsMenu
                    height="5px"
                    actions={this.state.moreActions}
                  />

                  <StyledAuthor authorId={authorId} createdAt={createdAt} message="parentCommentAuthor" />

                  <CommentBody className="e2e-comment-body" onClick={this.captureClick}>
                    <span dangerouslySetInnerHTML={{ __html: processedCommentText }} />
                  </CommentBody>
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

            <Modal opened={this.state.spamModalVisible} close={this.closeSpamModal}>
              <SpamReportForm resourceId={this.props.commentId} resourceType="comments" />
            </Modal>

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
