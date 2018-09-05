// Libraries
import React from 'react';
import { Subscription, combineLatest, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { take } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// Services
import { getGroupMemberships } from 'services/groupMemberships';
import { userByIdStream, IUser } from 'services/users';

// Components
import Avatar from 'components/Avatar';

// Style
import styled, { css } from 'styled-components';

const avatarSize = 74;

const StyledAvatar = styled(Avatar)`
  width: calc(${avatarSize}%);
  height: calc(${avatarSize}%);
  border-radius: 50%;
  box-sizing: border-box;
  border-style: solid;
  border-width: 2px;
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
        top: -4px;
        left: calc(50% - (${avatarSize}%/2));
      }

      &:nth-child(2) {
        z-index: 2;
        bottom: 0;
        right: -4px;
      }

      &:nth-child(3) {
        z-index: 1;
        bottom: 0;
        left: -4px;
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
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      users: null
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { groupId } = this.props;
    const streamParams = {
      queryParameters: {
        page: {
          size: 3,
          number: 1
        }
      }
    };

    const memberships$ = getGroupMemberships(groupId, streamParams).observable;

    this.subscriptions = [
      memberships$.pipe(
        switchMap((memberships) => {
          if (!isNilOrError(memberships) && memberships.data.length > 0) {
            return combineLatest(
              take(memberships.data, 3).map(membership => userByIdStream(membership.relationships.user.data.id).observable)
            );
          }

          return of(null);
        })
      ).subscribe((users) => {
        this.setState({ users });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { users } = this.state;

    if (!isNilOrError(users) && users.length > 0) {
      const className = this.props['className'];
      const count = users.length;

      return (
        <GroupAvatarWrapper className={className} count={count}>
          {users.map(user => <StyledAvatar key={user.data.id} userId={user.data.id} size="small" />)}
        </GroupAvatarWrapper>
      );
    }

    return <GroupAvatarWrapper />;
  }
}
