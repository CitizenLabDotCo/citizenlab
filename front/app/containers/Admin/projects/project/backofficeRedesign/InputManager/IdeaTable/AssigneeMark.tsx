import React from 'react';

import Avatar from 'design-system/Avatar';
import TooltipMark from 'design-system/Tooltip/TooltipMark';

import useUserById from 'api/users/useUserById';

import { getFullName } from 'utils/textUtils';

interface Props {
  assigneeId: string | undefined;
}

// The library's list cell: a 16 px avatar, and nothing when unassigned.
const AssigneeMark = ({ assigneeId }: Props) => {
  const { data: user } = useUserById(assigneeId);

  if (!assigneeId || !user) return null;

  const name = getFullName(user.data);

  return (
    <TooltipMark label={name}>
      <Avatar
        content="image"
        src={user.data.attributes.avatar?.small ?? undefined}
        alt={name}
        size={16}
      />
    </TooltipMark>
  );
};

export default AssigneeMark;
