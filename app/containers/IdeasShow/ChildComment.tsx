import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// libraries
import { Link, browserHistory } from 'react-router';
import linkifyHtml from 'linkifyjs/html';

// components
import Avatar from 'components/Avatar';
import Modal from 'components/UI/Modal';
import SpamReportForm from 'containers/SpamReport';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import UserName from 'components/UI/UserName';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';
import { commentStream, IComment } from 'services/comments';
import { userByIdStream, IUser } from 'services/users';
import { authUserStream } from 'services/auth';

// i18n
import { FormattedRelative } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';

// style
import styled from 'styled-components';
import { transparentize, darken } from 'polished';
import { Locale } from 'typings';
import { media } from 'utils/styleUtils';

const StyledMoreActionsMenu: any = styled(MoreActionsMenu)`
  position: absolute;
  top: 5px;
  right: 15px;
  opacity: 0;
  transition: opacity 100ms ease-out;

  ${media.smallerThanMaxTablet`
    opacity: 1;
  `}
`;

const CommentContainer = styled.div`
  margin-top: 0px;
  margin-bottom: 10px;
  padding: 20px;
  position: relative;
  border: none;
  background: #f8f8f8;
  border-radius: 5px;

  &:hover {
    ${StyledMoreActionsMenu} {
      opacity: 1;
    }
  }
`;

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  margin-bottom: 20px;
  padding: 0;
`;

const AuthorAvatar = styled(Avatar)`
  width: 25px;
  height: 25px;
  margin-right: 8px;
`;

const AuthorMeta = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorNameContainer = styled.div `
  color: #333;
  font-size: 14px;
  font-weight: 400;
`;

const AuthorName = styled(Link)`
  color: ${(props) => props.theme.colors.clBlue};
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: ${(props) => darken(0.15, props.theme.colors.clBlue)};
    text-decoration: underline;
  }
`;

const TimeAgo = styled.div`
  color: #585858;
  color: #999;
  font-size: 13px;
  line-height: 17px;
  font-weight: 300;
  margin-top: 0px;
`;

const CommentBody = styled.div`
  color: #666;
  font-size: 15px;
  line-height: 22px;
  font-weight: 300;
  padding: 0;

  span,
  p {
    white-space: pre-wrap;
    word-break: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    margin-bottom: 25px;
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

type Props = {
  commentId: string;
};

type State = {
  locale: Locale | null;
  currentTenantLocales: Locale[] | null;
  comment: IComment | null;
  author: IUser | null;
  spamModalVisible: boolean;
  moreActions: IAction[];
};

export default class ChildComment extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenantLocales: null,
      comment: null,
      author: null,
      spamModalVisible: false,
      moreActions: [],
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { commentId } = this.props;
    const locale$ = localeStream().observable;
    const currentTenantLocales$ = currentTenantStream().observable.map(currentTenant => currentTenant.data.attributes.settings.core.locales);
    const comment$ = commentStream(commentId).observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenantLocales$,
        comment$
      ).switchMap(([locale, currentTenantLocales, comment]) => {
        const authorId = comment.data.relationships.author.data ? comment.data.relationships.author.data.id : null;
        if (!authorId) {
          return Rx.Observable.of({ locale, currentTenantLocales, comment, author: null });
        }

        const author$ = userByIdStream(authorId).observable;
        return author$.map(author => ({ locale, currentTenantLocales, comment, author }));
      }).subscribe(({ locale, currentTenantLocales, comment, author }) => {
        this.setState({ locale, currentTenantLocales, comment, author });
      })
    ];

    this.subscriptions.push(
      authUserStream().observable
      .subscribe((authUser) => {
        if (authUser) {
          this.setState({ moreActions: [
            ...this.state.moreActions,
            { label: <FormattedMessage {...messages.reportAsSpam} />, handler: this.openSpamModal }
          ]});
        }
      })
    );
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  goToUserProfile = () => {
    const { author } = this.state;

    if (author) {
      browserHistory.push(`/profile/${author.data.attributes.slug}`);
    }
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
    const { locale, currentTenantLocales, comment, author } = this.state;

    if (locale && currentTenantLocales && comment && author) {
      const className = this.props['className'];
      const authorId = comment.data.relationships.author.data ? comment.data.relationships.author.data.id : null;
      const createdAt = comment.data.attributes.created_at;
      const commentBodyMultiloc = comment.data.attributes.body_multiloc;
      const commentText = getLocalized(commentBodyMultiloc, locale, currentTenantLocales);
      const processedCommentText = linkifyHtml(commentText.replace(
        /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>([\S\s]*?)<\/span>/gi,
        '<a class="mention" data-link="/profile/$2" href="/profile/$2">$3</a>'
      ));

      return (
        <CommentContainer className={className}>
          <StyledMoreActionsMenu
            height="5px"
            actions={this.state.moreActions}
          />

          <AuthorContainer>
            <AuthorAvatar userId={authorId} size="small" onClick={this.goToUserProfile} />
            <AuthorMeta>
              <AuthorNameContainer>
                <FormattedMessage
                  {...messages.childCommentAuthor}
                  values={{
                    authorNameComponent: <AuthorName to={author ? `/profile/${author.data.attributes.slug}` : ''}><UserName user={author} /></AuthorName>
                  }}
                />
              </AuthorNameContainer>
              <TimeAgo>
                <FormattedRelative value={createdAt} />
              </TimeAgo>
            </AuthorMeta>
          </AuthorContainer>

          <CommentBody onClick={this.captureClick}>
            <span dangerouslySetInnerHTML={{ __html: processedCommentText }} />
          </CommentBody>

          <Modal opened={this.state.spamModalVisible} close={this.closeSpamModal}>
            <SpamReportForm resourceId={this.props.commentId} resourceType="comments" />
          </Modal>
        </CommentContainer>
      );
    }

    return null;
  }
}
