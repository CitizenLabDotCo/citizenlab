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
import { injectIntl, InjectedIntlProps, FormattedMessage, FormattedRelative } from 'react-intl';
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
  width: 34px;
  height: 34px;
  margin-right: 12px;
  margin-top: -1px;
`;

const AuthorMeta = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled(Link) `
  color: #333;
  color: ${(props) => props.theme.colorMain};
  font-size: 15px;
  line-height: 19px;
  font-weight: 300;
  text-decoration: none;
  margin-bottom: 1px;

  &:hover {
    color: #000;
    color: ${(props) => darken(0.15, props.theme.colorMain)};
    text-decoration: underline;
  }
`;

const TimeAgo = styled.div`
  color: #999;
  font-size: 13px;
  line-height: 17px;
  font-weight: 300;
`;

type Props = {
  authorId: string;
  createdAt: string;
};

type State = {
  author: IUser | null;
};

class Author extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      author: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { authorId } = this.props;
    const author$ = userByIdStream(authorId).observable;

    this.subscriptions = [
      author$.subscribe(author => this.setState({ author }))
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

  render() {
    const className = this.props['className'];
    const { authorId, createdAt } = this.props;
    const { formatRelative } = this.props.intl;
    const { author } = this.state;

    if (author) {
      const avatar = author.data.attributes.avatar.medium;
      const slug = author.data.attributes.slug;
      const firstName = author.data.attributes.first_name;
      const lastName = author.data.attributes.last_name;

      return (
        <AuthorContainer className={className}>
          <AuthorAvatar userId={authorId} size="medium" onClick={this.goToUserProfile} />
          <AuthorMeta>
            <AuthorName to={`/profile/${author.data.attributes.slug}`}>
              {/* <FormattedMessage {...messages.byAuthor} values={{ firstName, lastName }} /> */}
              {firstName} {lastName}
            </AuthorName>
            <TimeAgo>
              <FormattedRelative value={createdAt} />
            </TimeAgo>
          </AuthorMeta>
        </AuthorContainer>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(Author);
