import React from 'react';

import { IPhasePermissionAction } from 'api/permissions/types';
import useInheritPhasePermission from 'api/phase_permissions/useInheritPhasePermission';
import useOverridePhasePermission from 'api/phase_permissions/useOverridePhasePermission';
import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import useUpdatePhasePermission from 'api/phase_permissions/useUpdatePhasePermission';
import usePhase from 'api/phases/usePhase';

import { getPermissionActionSectionSubtitle } from 'containers/Admin/projects/project/permissions/Phase/ActionForms/utils';

import ActionForm from 'components/admin/ActionForm';

import { useIntl } from 'utils/cl-intl';

interface Props {
  phaseId: string;
  action: IPhasePermissionAction;
  variant: 'plain' | 'data';
}

/** A phase action's permission form, saving each change as it is made. */
const PhaseActionForm = ({ phaseId, action, variant }: Props) => {
  const { formatMessage } = useIntl();
  const { data: phase } = usePhase(phaseId);
  const { data: permissions } = usePhasePermissions({ phaseId });
  const { mutateAsync: updatePhasePermission } = useUpdatePhasePermission();
  const { mutateAsync: overridePhasePermission } = useOverridePhasePermission();
  const { mutateAsync: inheritPhasePermission } = useInheritPhasePermission();

  const permission = permissions?.data.find(
    ({ attributes }) => attributes.action === action
  );

  if (!permission || !phase) return null;

  return (
    <ActionForm
      phaseId={phaseId}
      permissionData={permission}
      title={formatMessage(
        getPermissionActionSectionSubtitle({
          permissionAction: action,
          participationMethod: phase.data.attributes.participation_method,
        })
      )}
      variant={variant}
      onChange={async (changes) => {
        await updatePhasePermission({
          permissionId: permission.id,
          phaseId,
          action,
          permission: changes,
        });
      }}
      onOverride={async () => {
        await overridePhasePermission({ phaseId, action });
      }}
      onRevertToDefaults={async () => {
        await inheritPhasePermission({ phaseId, action });
      }}
    />
  );
};

export default PhaseActionForm;
