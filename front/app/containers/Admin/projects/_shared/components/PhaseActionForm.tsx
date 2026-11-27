import React from 'react';

import { IPermissionData, IPhasePermissionAction } from 'api/permissions/types';
import useInheritPhasePermission from 'api/phase_permissions/useInheritPhasePermission';
import useOverridePhasePermission from 'api/phase_permissions/useOverridePhasePermission';
import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import useUpdatePhasePermission from 'api/phase_permissions/useUpdatePhasePermission';
import usePhase from 'api/phases/usePhase';

import { getPermissionActionSectionSubtitle } from 'containers/Admin/projects/project/permissions/Phase/ActionForms/utils';

import ActionForm from 'components/admin/ActionForm';
import { Changes } from 'components/admin/ActionForm/types';

import { useIntl } from 'utils/cl-intl';

interface Props {
  phaseId: string;
  action: IPhasePermissionAction;
  variant: 'plain' | 'data';
  showData?: boolean;
  // When given, changes wait here until the caller saves them; the form shows
  // them on top of the saved permission.
  staged?: Changes;
  onStage?: (changes: Changes) => void;
}

// The permission as it will be once the staged changes are saved.
const withStaged = (
  permission: IPermissionData,
  staged: Changes
): IPermissionData => {
  const { group_ids, ...attributes } = staged;

  return {
    ...permission,
    attributes: { ...permission.attributes, ...attributes },
    relationships: group_ids
      ? {
          ...permission.relationships,
          groups: { data: group_ids.map((id) => ({ id, type: 'group' })) },
        }
      : permission.relationships,
  };
};

/** A phase action's permission form, saving each change as it is made unless the caller stages them. */
const PhaseActionForm = ({
  phaseId,
  action,
  variant,
  showData,
  staged,
  onStage,
}: Props) => {
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
      permissionData={staged ? withStaged(permission, staged) : permission}
      title={formatMessage(
        getPermissionActionSectionSubtitle({
          permissionAction: action,
          participationMethod: phase.data.attributes.participation_method,
        })
      )}
      variant={variant}
      showData={showData}
      onChange={async (changes) => {
        if (onStage) {
          onStage(changes);
          return;
        }
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
