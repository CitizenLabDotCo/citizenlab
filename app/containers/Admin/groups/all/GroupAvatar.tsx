// Libraries
import * as React from 'react';
import * as Rx from 'rxjs';
import * as _ from 'lodash';

// Services
import { listMembership } from 'services/groups';
import { userByIdStream, IUser } from 'services/users';

// Components
import Avatar from 'components/Avatar';

// Style
import styled, { css } from 'styled-components';

const avatarSize = 70;

const StyledAvatar = styled(Avatar)`
  width: calc(${avatarSize}%);
  height: calc(${avatarSize}%);
  border-radius: 50%;
  box-sizing: border-box;
  border-style: solid;
  border-width: 3px;
  border-color: #fff;
  background: #fff;
`;

const GroupAvatarWrapper: any = styled.div`
  width: 3em;
  height: 3em;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  ${(props: any) => props.count > 1 ? css`

    ${StyledAvatar} {
      position: absolute;

      &:nth-child(1) {
        z-index: 3;
        top: 0;
        left: calc(50% - (${avatarSize}%/2));
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
    }
  ` : css``};
`;

// Typings
interface Props {
  groupId: string;
}

interface State {
  users: IUser[] | null;
}

export default class GroupAvatar extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      users: null
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const memberships$ = listMembership(this.props.groupId, { queryParameters: { page: { size: 3, number: 1 } } }).observable;

    this.subscriptions = [
      memberships$.switchMap((memberships) => {
        if (memberships && memberships.data.length > 0) {
          return Rx.Observable.combineLatest(
            _.take(memberships.data, 3).map(membership => userByIdStream(membership.relationships.user.data.id).observable)
          );
        }

        return Rx.Observable.of(null);
      }).subscribe((users) => {
        this.setState({ users });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { users } = this.state;

    if (users && users.length > 0) {
      const className = this.props['className'];
      const count = users.length;

      return (
        <GroupAvatarWrapper className={className} count={count}>
          {users.map((user) => (
            <StyledAvatar key={user.data.id} userId={user.data.id} size="small" />
          ))}
        </GroupAvatarWrapper>
      );
    }

    return <GroupAvatarWrapper />;
  }
}
