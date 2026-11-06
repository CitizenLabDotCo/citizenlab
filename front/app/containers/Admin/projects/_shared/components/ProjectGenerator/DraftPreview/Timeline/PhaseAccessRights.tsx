import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { PermittedBy } from 'api/permissions/types';
import { isPhasePermissionAction } from 'api/permissions/utils';
import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';

import actionLabel from 'containers/Admin/projects/project/backofficeRedesign/Phase/BuildPanel/actionLabel';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import { DraftPhase } from '../../draft';
import messages from '../../messages';
import ChangedValue from '../Item/ChangedValue';
import OtherSettings from '../Item/OtherSettings';
import SettingRow from '../Item/SettingRow';

const ROW_KEYS = ['phase_id', 'action', 'permitted_by', 'group_ids'];

const PERMITTED_BY_LABELS: Record<PermittedBy, MessageDescriptor> = {
  everyone: messages.permittedByEveryone,
  users: messages.permittedByUsers,
  admins_moderators: messages.permittedByAdmins,
};

type Props = {
  phase: DraftPhase;
};

const PhaseAccessRights = ({ phase }: Props) => {
  const { formatMessage } = useIntl();
  const { data: permissions } = usePhasePermissions({ phaseId: phase.phaseId });
  const proposed = phase.permissionChange?.toolCall.attributes.arguments;
  const savedPermission = permissions?.data.find(
    ({ attributes }) => attributes.action === proposed?.action
  );

  if (!phase.phaseId) {
    return (
      <Text m="0px" fontSize="s" color="textSecondary">
        {formatMessage(messages.accessRightsAfterApproval)}
      </Text>
    );
  }

  const describe = (permittedBy: PermittedBy, groupCount: number) => {
    const permittedByLabel = formatMessage(PERMITTED_BY_LABELS[permittedBy]);
    return permittedBy === 'users' && groupCount > 0
      ? formatMessage(messages.permittedGroups, {
          permittedBy: permittedByLabel,
          count: groupCount,
        })
      : permittedByLabel;
  };

  return (
    <Box>
      {permissions?.data.map(({ attributes, relationships }) => {
        const { action } = attributes;
        if (!isPhasePermissionAction(action)) return null;

        const args = proposed?.action === action ? proposed : undefined;
        const savedGroupCount = relationships.groups.data.length;
        const permittedBy = args?.permitted_by ?? attributes.permitted_by;
        const groupCount = args?.group_ids?.length ?? savedGroupCount;
        const label = describe(permittedBy, groupCount);
        const previousLabel = describe(
          attributes.permitted_by,
          savedGroupCount
        );

        return (
          <SettingRow key={action} label={formatMessage(actionLabel(action))}>
            <Text m="0px" fontSize="s">
              <ChangedValue
                changed={!!args}
                // Swapping groups keeps the count, so only a different text is compared.
                previous={previousLabel === label ? undefined : previousLabel}
              >
                {label}
              </ChangedValue>
            </Text>
          </SettingRow>
        );
      })}
      {proposed && (
        <OtherSettings
          title={formatMessage(messages.otherSettingsFor, {
            action: formatMessage(actionLabel(proposed.action)),
          })}
          values={{ proposed, saved: savedPermission?.attributes }}
          shownKeys={ROW_KEYS}
        />
      )}
    </Box>
  );
};

export default PhaseAccessRights;
