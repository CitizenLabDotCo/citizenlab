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
  if (!permissions || !permissions.length || !groups) {
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
          {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
          {permissions &&
            permissions.length > 1 &&
            permissions.map((permission) => {
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
