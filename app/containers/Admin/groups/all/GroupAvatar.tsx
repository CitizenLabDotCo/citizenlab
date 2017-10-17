// Libraries
import * as React from 'react';
import * as Rx from 'rxjs';

// Services
import { listMembership, Membership } from 'services/groups';
import { userByIdStream, IUserData } from 'services/users';

// Components
import Avatar from 'components/Avatar';

// Style
import styled from 'styled-components';

const GroupAvatarWrapper = styled.div`
  position: relative;
  height: 4rem;
  width: 4rem;
`;

const StyledAvatar = styled(Avatar)`
  background: white;
  border-radius: 50%;
  border: 2px solid white;
  box-sizing: border-box;
  height: calc(70%);
  position: absolute;
  width: calc(70%);

  &:nth-child(1) {
    z-index: 3;
    top: 0;
    left: calc(50% - 35%);
  }

  &:nth-child(2) {
    z-index: 2;
    bottom: 0;
    right: 0;
  }

  &:nth-child(3) {
    z-index: 1;
    bottom: 0;
    left: 0;
  }
`;


// Typings
interface Props {
  groupId: string;
}

interface State {
  users: IUserData[];
}

class GroupsList extends React.Component<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor() {
    super();

    this.state = {
      users: [],
    };

    this.subscriptions = [];
  }

  componentDidMount() {
    listMembership(this.props.groupId).observable.first()
    .switchMap((response) => {
      return response.data.map((membership) => membership.relationships.user.data.id);
    })
    .switchMap((userId) => {
      return userByIdStream(userId).observable;
    })
    .take(3)
    .subscribe((user) => {
      const { users } = this.state;
      users.push(user.data);
      this.setState({ users });
    });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  render() {
    return (
      <GroupAvatarWrapper>
        {this.state.users.map((user) => (
          <StyledAvatar key={user.id} userId={user.id} size="small" />
        ))}
      </GroupAvatarWrapper>
    );
  }
}

export default GroupsList;
