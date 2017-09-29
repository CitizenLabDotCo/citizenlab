import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import { Link } from 'react-router';
import Avatar from 'components/Avatar';

// services
import { userStream, IUser } from 'services/users';

// i18n
import { FormattedRelative, FormattedMessage } from 'react-intl';
import messages from '../../messages';

// style
import styled from 'styled-components';

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
`;

const AuthorAvatar = styled(Avatar)`
  flex: 0 0 30px;
  height: 30px;
  width: 30px;
`;

const AuthorName = styled(Link)`
  font-weight: bold;
  color: #484848;
  font-size: 16px;
  flex-grow: 1;
  padding-left: 12px;
`;

const Timing = styled.div`
  font-size: 14px;
  color: #a9a9a9;
`;

type Props = {
  authorId: string;
  createdAt: string;
};

type State = {
  author: IUser | null;
};

export default class Author extends React.PureComponent<Props, State> {
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
    const author$ = userStream(authorId).observable;

    this.subscriptions = [
      author$.subscribe(author => this.setState({ author }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { authorId, createdAt } = this.props;
    const { author } = this.state;

    if (author) {
      const avatar = author.data.attributes.avatar.medium;
      const slug = author.data.attributes.slug;
      const firstName = author.data.attributes.first_name;
      const lastName = author.data.attributes.last_name;

      return (
        <AuthorContainer>
          <AuthorAvatar userId={authorId} size="medium" />

          <AuthorName to={`/profile/${slug}`}>
            <FormattedMessage {...messages.authorSaid} values={{ firstName }} />
          </AuthorName>

          <Timing>
            <FormattedRelative value={createdAt} />
          </Timing>
        </AuthorContainer>
      );
    }

    return null;
  }
}
