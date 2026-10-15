import React from 'react';

import { IUsers } from 'api/users/types';

import ManagerBubbles from '../_shared/ManagerBubbles';

import { toManager } from './List/useManagers';

interface Props {
  users?: IUsers;
}

// Who manages the level, beside its name. Nothing shows while they load or
// when there are none.
const LevelManagers = ({ users }: Props) => {
  if (!users || users.data.length === 0) return null;

  return <ManagerBubbles managers={users.data.map(toManager)} />;
};

export default LevelManagers;
