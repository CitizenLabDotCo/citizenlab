// Libraries
import * as React from 'react';
import * as Rx from 'rxjs';

// Services
import { listMembership, deleteMembership } from 'services/groups';
import { userByIdStream, IUserData } from 'services/users';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';

// Components
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';
import Avatar from 'components/Avatar';
import { List, Row } from 'components/admin/ResourceList';

// Style
import styled from 'styled-components';

const EmptyStateMessage = styled.p`
  background: rgba(1, 161, 177, 0.07);
  border-radius: 5px;
  color: #01A1B1;
  display: flex;
  align-items: center;
  font-size: 1.15rem;
  padding: 1.5rem;

  svg {
    height: 1em;
    margin-right: 2rem;
  }
`;

const StyledAvatar = styled(Avatar)`
  width: 2rem;
  height: 2rem;
`;

const StyledList = styled(List)`
  position: relative;
  z-index: 0;
`;

// Typings
interface Props {
  groupId: string;
}

interface State {
  users: {user: IUserData, membershipId: string}[];
  loading: boolean;
}

class MembersListTable extends React.Component<Props & InjectedIntlProps, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);

    this.state = {
      users: [],
      loading: false,
    };

    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions.push(this.updateMembers());
  }

  componentWillUnmount() {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  updateMembers = () => {
    this.setState({
      loading: true,
    });

    return listMembership(this.props.groupId).observable
    .map((response) => {
      return response.data.map((membership) => ({
        userId: membership.relationships.user.data.id,
        membershipId: membership.id
      }));
    })
    .switchMap((usersArray) => {
      // Empty users array means we can immediately resolve with an empty users list
      if (usersArray.length === 0) {
        return Rx.Observable.of([]);
      }

      // Build an array of observables for each user
      const userRequests = usersArray.map(({ userId, membershipId }) =>
        userByIdStream(userId).observable.first().map((user) => ({
          membershipId,
          user: user.data,
        }))
      );

      // forkJoin will wait for each observable to complete and return with the array of results
      return Rx.Observable.forkJoin(userRequests);
    })
    .subscribe((users) => {
      this.setState({ users, loading: false });
    });
  }

  createDeleteHandler = (membershipId: string) => {
    const message = this.props.intl.formatMessage(messages.deleteConfirmMessage);
    return (): void => {
      if (window.confirm(message)) {
        deleteMembership(membershipId);
      }
    };
  }

  render() {
    const { users, loading } = this.state;

    if (loading) {
      return (
        <p>
          <FormattedMessage {...messages.loadingMessage} />
        </p>
      );
    }

    if (users.length === 0) {
      return (
        <EmptyStateMessage>
          <Icon name="warning" />
          <FormattedMessage {...messages.emptyListMessage} />
        </EmptyStateMessage>
      );
    }

    return (
      <StyledList>
        {users.map(({ user, membershipId }) => (
          <Row key={user.id}>
            <StyledAvatar userId={user.id} size="small" />
            <div className="expand">
              {`${user.attributes.first_name} ${user.attributes.last_name}`}
            </div>
            <div className="expand">
              {user.attributes.email}
            </div>
            <Button
              onClick={this.createDeleteHandler(membershipId)}
              style="text"
              circularCorners={false}
              icon="delete"
            >
              <FormattedMessage {...messages.deleteLabel} />
            </Button>
          </Row>
        ))}
      </StyledList>
    );
  }
}

export default injectIntl<Props>(MembersListTable);
