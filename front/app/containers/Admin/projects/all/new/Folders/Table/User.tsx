import React from 'react';

import useUserById from 'api/users/useUserById';

import { getFullName } from 'utils/textUtils';

interface Props {
  userId: string;
}

const User = ({ userId }: Props) => {
  const { data: user } = useUserById(userId);
  if (!user) return null;

  return <>{getFullName(user.data)}</>;
};

export default User;
