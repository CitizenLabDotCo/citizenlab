import useOverridePhasePermission from 'api/phase_permissions/useOverridePhasePermission';
import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import useUpdatePhasePermission from 'api/phase_permissions/useUpdatePhasePermission';

import { Changes } from 'components/admin/ActionForm/types';

// The demographic questions of a form belong to the phase's 'posting_idea'
// permission, so the form builder reads and edits that permission.
const usePostingPermission = (phaseId: string | undefined) => {
  const { data: permissions } = usePhasePermissions({ phaseId });
  const { mutateAsync: updatePhasePermission } = useUpdatePhasePermission();
  const { mutateAsync: overridePhasePermission } = useOverridePhasePermission();

  const permission = permissions?.data.find(
    ({ attributes }) => attributes.action === 'posting_idea'
  );

  const updatePermission = async (changes: Changes) => {
    if (!phaseId || !permission) return;

    // An inherited permission has no record of its own to update yet.
    const permissionId = permission.attributes.inherited
      ? (await overridePhasePermission({ phaseId, action: 'posting_idea' }))
          .data.id
      : permission.id;

    await updatePhasePermission({
      permissionId,
      phaseId,
      action: 'posting_idea',
      permission: changes,
    });
  };

  return { permission, updatePermission };
};

export default usePostingPermission;
