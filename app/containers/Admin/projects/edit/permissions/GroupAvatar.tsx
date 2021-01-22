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

const AvatarWrapper = styled.div`
  padding: 2px;
  background: #fff;
  border-radius: 50%;
  display: flex;
`;

const GroupAvatarWrapper: any = styled.div`
  width: 65px;
  height: 3em;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  ${(props: any) =>
    props.count > 1
      ? css`
          ${AvatarWrapper} {
            position: absolute;

            &:nth-child(1) {
              left: 0px;
            }

            &:nth-child(2) {
              z-index: 1;
              left: 15px;
            }

            &:nth-child(3) {
              z-index: 2;
              left: 30px;
            }
          }
        `
      : css``};
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
      users: null,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { groupId } = this.props;
    const streamParams = {
      queryParameters: {
        page: {
          size: 3,
          number: 1,
        },
      },
    };

    const memberships$ = getGroupMemberships(groupId, streamParams).observable;

    this.subscriptions = [
      memberships$
        .pipe(
          switchMap((memberships) => {
            if (!isNilOrError(memberships) && memberships.data.length > 0) {
              return combineLatest(
                take(memberships.data, 3).map(
                  (membership) =>
                    userByIdStream(membership.relationships.user.data.id)
                      .observable
                )
              );
            }

            return of(null);
          })
        )
        .subscribe((users) => {
          this.setState({ users });
        }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { users } = this.state;

    if (!isNilOrError(users) && users.length > 0) {
      const className = this.props['className'];
      const count = users.length;

      return (
        <GroupAvatarWrapper className={className} count={count}>
          {users.map((user) => (
            <AvatarWrapper key={user.data.id}>
              <Avatar userId={user.data.id} size={30} />
            </AvatarWrapper>
          ))}
        </GroupAvatarWrapper>
      );
    }

    return <GroupAvatarWrapper />;
  }
}
