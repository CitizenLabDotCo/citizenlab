// Libraries
import React from 'react';

// Components
import Avatar from 'components/Avatar';

// Style
import styled, { css } from 'styled-components';
import useMemberships from 'api/group_memberships/useMemberships';
import useUser from 'hooks/useUser';
import { isNilOrError } from 'utils/helperUtils';

const AvatarWrapper = styled.div`
  padding: 2px;
  background: #fff;
  border-radius: 50%;
  display: flex;
`;

const GroupAvatarWrapper = styled.div<{ count: number }>`
  width: 65px;
  height: 3em;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  ${(props) =>
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
  className?: string;
}

const GroupAvatar = ({ groupId, className }: Props) => {
  const { data: memberships } = useMemberships({
    groupId,
    page: {
      size: 3,
      number: 1,
    },
  });

  const user1 = useUser({
    userId: memberships?.data[0]?.relationships?.user?.data?.id,
  });
  const user2 = useUser({
    userId: memberships?.data[1]?.relationships?.user?.data?.id,
  });
  const user3 = useUser({
    userId: memberships?.data[2]?.relationships?.user?.data?.id,
  });

  const users = [user1, user2, user3];

  const count = users.length;

  return (
    <GroupAvatarWrapper className={className} count={count}>
      {users.map((user) =>
        !isNilOrError(user) ? (
          <AvatarWrapper key={user.id}>
            <Avatar userId={user.id} size={30} />
          </AvatarWrapper>
        ) : null
      )}
    </GroupAvatarWrapper>
  );
};

export default GroupAvatar;
