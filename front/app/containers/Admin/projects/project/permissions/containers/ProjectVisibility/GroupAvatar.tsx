// Libraries
import React from 'react';

// Components
import Avatar from 'components/Avatar';

// Style
import styled, { css } from 'styled-components';
import useMemberships from 'api/group_memberships/useMemberships';
import useUserById from 'api/users/useUserById';
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

  const count = memberships?.data.length;

  return (
    <GroupAvatarWrapper className={className} count={count || 0}>
      {memberships?.data.map((membership) => (
        <UserAvatar
          key={membership.id}
          userId={membership.relationships.user.data.id}
        />
      ))}
    </GroupAvatarWrapper>
  );
};

const UserAvatar = ({ userId }: { userId?: string }) => {
  const { data: user } = useUserById(userId);
  if (isNilOrError(user)) return null;
  return (
    <AvatarWrapper>
      <Avatar userId={user.data.id} size={30} />
    </AvatarWrapper>
  );
};

export default GroupAvatar;
