import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { isToolCall } from 'api/ai_assistant_tool_calls/utils';
import { PermittedBy } from 'api/permissions/types';

import actionLabel from 'containers/Admin/projects/project/backofficeRedesign/Phase/BuildPanel/actionLabel';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import { ProposedChange } from '../draft';
import messages from '../messages';

const PERMITTED_BY_LABELS: Record<PermittedBy, MessageDescriptor> = {
  everyone: messages.permittedByEveryone,
  users: messages.permittedByUsers,
  admins_moderators: messages.permittedByAdmins,
};

type Props = {
  change?: ProposedChange;
};

// The draft doesn't show access rights, so only a proposed change to them is described.
const AccessRightsChange = ({ change }: Props) => {
  const { formatMessage } = useIntl();

  if (!change || !isToolCall(change.toolCall, 'update_phase_permission')) {
    return null;
  }

  const { action, permitted_by, group_ids } =
    change.toolCall.attributes.arguments;
  const permittedBy = formatMessage(PERMITTED_BY_LABELS[permitted_by]);
  const groupCount = group_ids?.length ?? 0;

  return (
    <Text m="0px" fontSize="s">
      {formatMessage(messages.accessRightsLine, {
        action: formatMessage(actionLabel(action)),
        permittedBy:
          permitted_by === 'users' && groupCount > 0
            ? formatMessage(messages.permittedGroups, {
                permittedBy,
                count: groupCount,
              })
            : permittedBy,
      })}
    </Text>
  );
};

export default AccessRightsChange;
