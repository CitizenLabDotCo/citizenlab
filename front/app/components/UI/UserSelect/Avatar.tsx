import React from 'react';
import styled from 'styled-components';
import { Icon } from '@citizenlab/cl2-component-library';
import useUser from 'hooks/useUser';
import { isNilOrError } from 'utils/helperUtils';

export const AvatarImage = styled.img`
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  fill: #596b7a;
  padding: 15px;
  border-radius: 50%;
  background: white;
  margin-right: 0.5rem;
`;

const AvatarIcon = styled(Icon)`
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  background: white;
  border-radius: 50%;
  fill: #596b7a;
  margin-right: 0.5rem;
`;

const Avatar = ({ userId }: { userId: string }) => {
  const user = useUser({ userId });

  if (!isNilOrError(user)) {
    const avatarSrc =
      user?.attributes?.avatar?.medium || user?.attributes?.avatar?.small;
    return (
      <>
        {avatarSrc ? (
          <AvatarImage className="avatarImage" src={avatarSrc} alt="" />
        ) : (
          <AvatarIcon className="avatarIcon" name="user-circle" />
        )}
      </>
    );
  }

  return null;
};

export default Avatar;
