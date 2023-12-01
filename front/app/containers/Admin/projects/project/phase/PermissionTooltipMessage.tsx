import React from 'react';
import { Box, Text } from '@citizenlab/cl2-component-library';
import useLocalize from 'hooks/useLocalize';
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { IPCPermissionData } from 'api/phase_permissions/types';
import useGroups from 'api/groups/useGroups';
import {
  getGroupMessage,
  getPartipationRequirementMessage,
  getParticipationActionLabel,
} from './utils';

type PermissionTooltipMessageProps = {
  permissions?: IPCPermissionData[];
};

const PermissionTooltipMessage = ({
  permissions,
}: PermissionTooltipMessageProps) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: groups } = useGroups({});
  if (!permissions || !permissions?.length || !groups) {
    return null;
  }

  const getParticipantsInPermission = (permission: IPCPermissionData) => {
    return permission.attributes.permitted_by === 'groups'
      ? getGroupMessage(permission, groups.data, localize, formatMessage)
      : getPartipationRequirementMessage(
          permission.attributes.permitted_by,
          permission.relationships.groups.data.length,
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
          <Text color="white" my="0px" variant="bodyS">
            {formatMessage(messages.whoCanParticipate)}
          </Text>
          {permissions &&
            permissions?.length > 1 &&
            permissions?.map((permission) => {
              return (
                <Text
                  color="white"
                  my="0px"
                  variant="bodyS"
                  key={permission.id}
                >
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
