import React from 'react';

import { Box, colors, Tooltip } from '@citizenlab/cl2-component-library';

import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  assigneeId: string | undefined;
}

const AssigneeMark = ({ assigneeId }: Props) => {
  const { formatMessage } = useIntl();

  if (!assigneeId) {
    return (
      <Tooltip content={formatMessage(messages.unassigned)} theme="dark">
        <Box
          width="22px"
          height="22px"
          borderRadius="50%"
          border={`1px dashed ${colors.grey400}`}
          aria-label={formatMessage(messages.unassigned)}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip
      content={<UserName userId={assigneeId} color={colors.white} />}
      theme="dark"
    >
      <Box display="inline-flex">
        <Avatar userId={assigneeId} size={22} />
      </Box>
    </Tooltip>
  );
};

export default AssigneeMark;
