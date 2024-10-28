import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useGroups from 'api/groups/useGroups';
import { IPhasePermissionData } from 'api/phase_permissions/types';

import { useIntl, FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import {
  getPartipationRequirementMessage,
  getParticipationActionLabel,
} from './utils';

type PermissionTooltipMessageProps = {
  permissions?: IPhasePermissionData[];
};

const PermissionTooltipMessage = ({
  permissions,
}: PermissionTooltipMessageProps) => {
  const { formatMessage } = useIntl();
  const { data: groups } = useGroups({});
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!permissions || !permissions?.length || !groups) {
    return null;
  }

  const getParticipantsInPermission = (permission: IPhasePermissionData) => {
    return getPartipationRequirementMessage(
      permission.attributes.permitted_by,
      formatMessage
    );
  };

  return (
    <Box w="216px">
      {permissions.length === 1 ? (
        <FormattedMessage
          {...messages.canParticipateTooltip}
          values={{
            participants: <b>{getParticipantsInPermission(permissions[0])}</b>,
          }}
        />
      ) : (
        <>
          <Text my="0px" variant="bodyS">
            {formatMessage(messages.whoCanParticipate)}
          </Text>
          {/* TODO: Fix this the next time the file is edited. */}
          {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
          {permissions &&
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            permissions?.length > 1 &&
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            permissions?.map((permission) => {
              return (
                <Text my="0px" variant="bodyS" key={permission.id}>
                  <FormattedMessage
                    {...getParticipationActionLabel(
                      permission.attributes.action
                    )}
                    values={{
                      participants: getParticipantsInPermission(permission),
                      b: (chunks) => (
                        <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
                      ),
                    }}
                  />
                </Text>
              );
            })}
        </>
      )}
    </Box>
  );
};

export default PermissionTooltipMessage;
