import React from 'react';

import Avatar from 'design-system/Avatar';
import TooltipMark from 'design-system/Tooltip/TooltipMark';

import useUserById from 'api/users/useUserById';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import messages from '../messages';

interface Props {
  assigneeId: string | undefined;
  size?: 16 | 24;
}

const AssigneeMark = ({ assigneeId, size = 24 }: Props) => {
  const { formatMessage } = useIntl();
  const { data: user } = useUserById(assigneeId);

  if (!assigneeId && size === 16) return null;

  if (!assigneeId) {
    return (
      <TooltipMark label={formatMessage(messages.unassigned)}>
        <Avatar content="empty" size={24} />
      </TooltipMark>
    );
  }

  if (!user) return null;

  const name = getFullName(user.data);

  return (
    <TooltipMark label={name}>
      <Avatar
        content="image"
        src={user.data.attributes.avatar?.small ?? undefined}
        alt={name}
        size={size}
      />
    </TooltipMark>
  );
};

export default AssigneeMark;
