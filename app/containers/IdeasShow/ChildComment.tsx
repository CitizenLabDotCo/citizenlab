import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import { Link, browserHistory } from 'react-router';

// components
import Avatar from 'components/Avatar';
import Modal from 'components/UI/Modal';
import SpamReportForm from 'containers/SpamReport';
import MoreActions, { Action } from 'components/UI/MoreActionsMenu';

// services
import { commentsForIdeaStream, commentStream, IComments, IComment } from 'services/comments';
import { userByIdStream, IUser } from 'services/users';
import { authUserStream } from 'services/auth';

// i18n
import T from 'components/T';
import { InjectedIntlProps, FormattedRelative } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { darken } from 'polished';

const CommentContainer = styled.div`
  margin-top: 0px;
  margin-bottom: 0px;
  padding: 30px;
  position: relative;
  border: none;
  border-top: solid 1px #e4e4e4;
  background: #f6f6f6;
`;

const StyledActions: any = styled(MoreActions)`
  margin-top: 0;
  position: absolute;
  right: 0;
  top: 0;
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
  color: #1391A1;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;

  &:hover {
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
`;

type Props = {
  commentId: string;
};

type State = {
  comment: IComment | null;
  author: IUser | null;
  spamModalVisible: boolean;
  moreActions: Action[];
};

export default class ChildComment extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      comment: null,
      author: null,
      spamModalVisible: false,
      moreActions: [],
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { commentId } = this.props;
    const comment$ = commentStream(commentId).observable;

    this.subscriptions = [
      comment$.switchMap((comment) => {
        const authorId = comment.data.relationships.author.data ? comment.data.relationships.author.data.id : null;
        if (!authorId) {
          return Rx.Observable.of({ comment, author: null });
        }
        const author$ = userByIdStream(authorId).observable;
        return author$.map(author => ({ comment, author }));
      }).subscribe(({ comment, author }) => this.setState({ comment, author }))
    ];

    this.subscriptions.push(
      authUserStream().observable
      .subscribe((authUser) => {
        if (authUser) {
          this.setState({ moreActions: [
            ...this.state.moreActions,
            {
              label: 'Report as spam',
              handler: this.openSpamModal,
            }
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

  openSpamModal = () => {
    this.setState({ spamModalVisible: true });
  }
  closeSpamModal = () => {
    this.setState({ spamModalVisible: false });
  }

  render() {
    const { comment, author } = this.state;

    if (comment && author) {
      const className = this.props['className'];
      const ideaId = comment.data.relationships.idea.data.id;
      const authorId = comment.data.relationships.author.data ? comment.data.relationships.author.data.id : null;
      const createdAt = comment.data.attributes.created_at;
      const commentBodyMultiloc = comment.data.attributes.body_multiloc;
      const avatar = author.data.attributes.avatar.medium;
      const slug = author.data.attributes.slug;
      const firstName = author.data.attributes.first_name;
      const lastName = author.data.attributes.last_name;

      return (
        <CommentContainer className={className}>
          <StyledActions actions={this.state.moreActions} hideLabel={true} />

          <AuthorContainer>
            <AuthorAvatar userId={authorId} size="small" onClick={this.goToUserProfile} />
            <AuthorMeta>
              <AuthorNameContainer>
                <FormattedMessage
                  {...messages.childCommentAuthor}
                  values={{
                    authorNameComponent: <AuthorName to={`/profile/${author.data.attributes.slug}`}>{firstName} {lastName}</AuthorName>
                  }}
                />
              </AuthorNameContainer>
              <TimeAgo>
                <FormattedRelative value={createdAt} />
              </TimeAgo>
            </AuthorMeta>
          </AuthorContainer>

          <CommentBody>
            <T value={commentBodyMultiloc} />
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
