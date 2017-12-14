import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import { Link, browserHistory } from 'react-router';
import linkifyHtml from 'linkifyjs/html';

// components
import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { commentsForIdeaStream, commentStream, IComments, IComment } from 'services/comments';
import { userByIdStream, IUser } from 'services/users';

// i18n
import T from 'components/T';
import { InjectedIntlProps, FormattedRelative } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';

// style
import styled from 'styled-components';
import { transparentize, darken } from 'polished';

const CommentContainer = styled.div`
  margin-top: 0px;
  margin-bottom: 0px;
  padding: 30px;
  border: none;
  border-top: solid 1px #e4e4e4;
  background: #f6f6f6;
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
  flex-direction: row;
`;

const AuthorNameContainer = styled.div `
  color: #333;
  font-size: 14px;
  font-weight: 400;
  margin-right: 35px;
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
  margin-top: 2px;
`;

const CommentBody = styled.div`
  color: #6B6B6B;
  font-size: 15px;
  line-height: 22px;
  font-weight: 400;
  padding: 0;

  span, p {
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
  locale: string | null;
  currentTenantLocales: string[] | null;
  comment: IComment | null;
  author: IUser | null;
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
      author: null
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

  render() {
    const { locale, currentTenantLocales, comment, author } = this.state;

    if (locale && currentTenantLocales && comment && author) {
      const className = this.props['className'];
      const ideaId = comment.data.relationships.idea.data.id;
      const authorId = comment.data.relationships.author.data ? comment.data.relationships.author.data.id : null;
      const createdAt = comment.data.attributes.created_at;
      const commentBodyMultiloc = comment.data.attributes.body_multiloc;
      const avatar = author.data.attributes.avatar.medium;
      const slug = author.data.attributes.slug;
      const commentText = getLocalized(commentBodyMultiloc, locale, currentTenantLocales);
      const processedCommentText = linkifyHtml(commentText.replace(
        /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>([\S\s]*?)<\/span>/gi, 
        '<a class="mention" data-link="/profile/$2" href="/profile/$2">$3</a>'
      ));

      return (
        <CommentContainer className={className}>

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

        </CommentContainer>
      );
    }

    return null;
  }
}
