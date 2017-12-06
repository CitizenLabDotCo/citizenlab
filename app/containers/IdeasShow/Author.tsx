import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { Link, browserHistory } from 'react-router';

// components
import Avatar from 'components/Avatar';

// services
import { userByIdStream, IUser } from 'services/users';

// i18n
import { InjectedIntlProps, FormattedRelative, FormattedDate } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { darken } from 'polished';

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
`;

const AuthorAvatar = styled(Avatar)`
  width: 31px;
  height: 31px;
  margin-right: 8px;
  margin-top: 0px;
`;

const AuthorMeta = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorNameContainer = styled.div `
  color: #333;
  font-size: 16px;
  line-height: 19px;
  font-weight: 400;
  text-decoration: none;
`;

const AuthorName = styled(Link)`
  color: #1391A1;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const DeletedUser = styled.span`
  font-style: italic;
`;

const TimeAgo = styled.div`
  color: #999;
  font-size: 13px;
  line-height: 17px;
  font-weight: 300;
  margin-top: 1px;
`;

type Props = {
  authorId: string | null;
  createdAt?: string | undefined;
  message?: string | undefined;
};

type State = {
  author: IUser | null;
};

class Author extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      author: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { authorId } = this.props;
    if (authorId) {
      const author$ = userByIdStream(authorId).observable;

      this.subscriptions = [
        author$.subscribe(author => this.setState({ author }))
      ];
    }
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

  render() {
    const className = this.props['className'];
    const children = this.props['children'];
    let { message } = this.props;
    const { authorId, createdAt } = this.props;
    const { formatRelative } = this.props.intl;
    const { author } = this.state;

    message = (message ? message : 'author');

    const avatar = author ?  author.data.attributes.avatar.medium : null;
    const slug = author ?  author.data.attributes.slug : null;
    const firstName = author ?  author.data.attributes.first_name : null;
    const lastName = author ?  author.data.attributes.last_name : null;

    let authorNameComponent;

    if (author && firstName && lastName) {
      authorNameComponent = (
        <AuthorName to={`/profile/${author.data.attributes.slug}`}>
          {`${firstName} ${lastName}`}
        </AuthorName>
      );
    } else {
      authorNameComponent = (
        <DeletedUser><FormattedMessage {...messages.deletedUser} /></DeletedUser>
      );
    }

    return (
      <AuthorContainer className={className}>
        <AuthorAvatar userId={authorId} size="small" onClick={author ? this.goToUserProfile : () => {}} />
        <AuthorMeta>
          <AuthorNameContainer>
            <FormattedMessage
              {...messages[`${message}`]}
              values={{ authorNameComponent }}
            />
          </AuthorNameContainer>
          {createdAt &&
            <TimeAgo>
              <FormattedRelative value={createdAt} />
            </TimeAgo>
          }
        </AuthorMeta>
      </AuthorContainer>
    );
  }
}

export default injectIntl<Props>(Author);
