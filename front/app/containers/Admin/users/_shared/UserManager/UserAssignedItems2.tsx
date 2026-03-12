import React from 'react';

import useTreeView from 'api/spaces/useTreeView';
import { IUserData } from 'api/users/types';

interface Props {
  user: IUserData;
}

const UserAssignedItems2 = ({ user }: Props) => {
  const { data: treeView } = useTreeView();

  return <></>;
};

export default UserAssignedItems2;
