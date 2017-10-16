// Libraries
import * as React from 'react';
import * as Rx from 'rxjs';

// Services
import { listMembership, Membership } from 'services/groups';
import { userByIdStream, IUserData } from 'services/users';

// Style
import styled from 'styled-components';

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
    this.subscriptions.push();
  }

  render() {
    return (
      <div>
        {this.state.users.map((user) => (
          <img key={user.id} src={user.attributes.avatar.small} alt="" role="presentation" />
        ))}
      </div>
    );
  }
}

export default GroupsList;
