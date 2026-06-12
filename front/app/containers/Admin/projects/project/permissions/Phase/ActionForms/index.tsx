import React from 'react';

import { IconTooltip, Box } from '@citizenlab/cl2-component-library';

import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import useResetPhasePermission from 'api/phase_permissions/useResetPhasePermission';
import useUpdatePhasePermission from 'api/phase_permissions/useUpdatePhasePermission';
import usePhase from 'api/phases/usePhase';

import ActionForm from 'components/admin/ActionForm';

import { useIntl, FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import { getPermissionActionSectionSubtitle } from './utils';
import utilMessages from './utils/messages';

type Props = {
  phaseId: string;
};

const ActionForms = ({ phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: phase } = usePhase(phaseId);
  const { data: permissions } = usePhasePermissions({ phaseId });
  const { mutateAsync: updatePhasePermission } = useUpdatePhasePermission();
  const { mutate: resetPhasePermission } = useResetPhasePermission();

  if (!permissions || !phase) return null;

  const participationMethod = phase.data.attributes.participation_method;

  if (permissions.data.length === 0) {
    return (
      <p>
        <FormattedMessage {...messages.noActionsCanBeTakenInThisProject} />
      </p>
    );
  }

  // The ActionForm panel collapses on its own, so it starts open only when there
  // is a single action to configure; with several, they all start collapsed.
  const defaultOpen = permissions.data.length === 1;

  return (
    <>
      {permissions.data.map((permission) => {
        const permissionAction = permission.attributes.action;

        return (
          <ActionForm
            key={permission.id}
            phaseId={phaseId}
            permissionData={permission}
            defaultOpen={defaultOpen}
            title={
              <Box display="flex">
                <FormattedMessage
                  {...getPermissionActionSectionSubtitle({
                    permissionAction,
                    participationMethod,
                  })}
                />
                {permissionAction === 'attending_event' && (
                  <IconTooltip
                    ml="4px"
                    content={formatMessage(
                      utilMessages.permissionAction_attending_event_tooltip
                    )}
                  />
                )}
              </Box>
            }
            onChange={async (permissionChanges) => {
              await updatePhasePermission({
                permissionId: permission.id,
                phaseId,
                action: permissionAction,
                permission: permissionChanges,
              });
            }}
            onReset={() =>
              resetPhasePermission({
                permissionId: permission.id,
                phaseId,
                action: permission.attributes.action,
              })
            }
          />
        );
      })}
    </>
  );
};

export default ActionForms;
